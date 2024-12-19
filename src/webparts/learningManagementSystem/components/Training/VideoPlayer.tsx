import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from "react-icons/fa";
import "./VideoPlayer.css"; // Add relevant styles here
import { IoSettingsSharp } from "react-icons/io5";

import Modal from 'react-bootstrap/Modal';
// import styles from "../LearningManagementSystem.module.scss";
import Assessment, { IQuestionProps } from "../Assessment/Assessment";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { LMSApplicationService } from "../../service/LMSService";
interface VideoPlayerProps {
    videoUrl: string;
    userId: number;
    context: WebPartContext;
    trainingId: string;
    onDataChange: (score: number, outOff: number) => void;
}

interface ITestStatus {
    LearningId: string,
    LearningType: string,
    Status: string,
    TestCandidatedId: number,
    TestScore: number,
    TestValue: { QuestionId: number, Answer: string }[],
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, userId, context, trainingId, onDataChange }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const bufferRef = useRef<HTMLDivElement | null>(null);
    const volumeRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [phase, setPhase] = useState<IQuestionProps[]>([]);
    const [question, setQuestion] = useState<IQuestionProps[]>([]);
    const [displayedQuestions, setDisplayedQuestions] = useState<number[]>([]);

    const [testStatus, setTestStatus] = useState<ITestStatus | null>(null);
    const [testScore, setTestScore] = useState<number | null>(null);

    const checkTestStatus = async (Id: string, Type: string, userId: number): Promise<void> => {
        const service = new LMSApplicationService(context);
        try {
            const status = await service.getLearningScore(Id, Type, userId);
            const testData: ITestStatus = {
                LearningId: status[0]?.LearningId,
                LearningType: status[0]?.LearningType,
                TestCandidatedId: status[0]?.TestCandidateId,
                TestScore: status[0]?.TestScore,
                Status: status[0]?.Status,
                TestValue: JSON.parse(status[0]?.TestValue)
            }
            setTestStatus(testData);

        } catch (err) {
            console.error('Error checking test status:', err);
        }
    }

    useEffect(() => {
        if (trainingId) {
            checkTestStatus(trainingId, "Training", userId);
        }
    }, [trainingId]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const playPauseHandler = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const convertTimeToSeconds = (time: string): number => {
        const [hours, minutes, seconds] = time.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const fetchQuestions = async (learningType: string, learningId: string): Promise<void> => {
        const service = new LMSApplicationService(context);
        try {
            const questionsData = await service.getAssessment(learningType, learningId);
            const allQuestions: IQuestionProps[] = questionsData.map((question: any) => {
                const options = [
                    question.Option1,
                    question.Option2,
                    question.Option3,
                    question.Option4,
                ].filter((option) => option !== undefined && option !== null);

                return {
                    id: question.ID,
                    question: question.Question,
                    options: options.length > 0 ? options : ["No options available"],
                    correctAnswer: question.Answer ? question.Answer.split(":") : [],
                    questionType: question.QuestionType,
                    phaseDuration: convertTimeToSeconds(question.PhaseDuration),
                };
            });
            const sortedQuestions = allQuestions.sort((a, b) => a.phaseDuration - b.phaseDuration);

            setQuestion(sortedQuestions);
        } catch (error) {
            console.error("Failed to fetch questions", error);
        }
    };

    useEffect(() => {
        if (trainingId) {
            fetchQuestions("Training", trainingId);
        }
    }, [trainingId]);

    useEffect(() => {
        if (question.length === testStatus?.TestValue.length) {
            setTestScore(testStatus?.TestScore)
        }
    }, [testStatus]);

    useEffect(() => {
        if (testScore) {
            onDataChange(testScore, question.length);
        }
    }, [testScore,onDataChange]);

    const updateTimeHandler = () => {
        if (videoRef.current && !isDialogOpen) {
            setCurrentTime(videoRef.current.currentTime);

            // Update progress bar
            if (progressRef.current) {
                const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                progressRef.current.style.width = `${percentage}%`;
            }

            if (!testStatus || (testStatus.TestValue.length < question.length)) {
                const unansweredQuestions = question.filter(q =>
                    !testStatus?.TestValue.find(test => test.QuestionId === q.id)
                );
                // Find questions matching the current time
                const currentQuestions = unansweredQuestions.filter(
                    (q) =>
                        q.phaseDuration <= videoRef.current!.currentTime &&
                        !displayedQuestions.includes(q.id)
                );

                // Open dialog if there are questions to display
                if (currentQuestions.length > 0) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                    setIsDialogOpen(true);
                    setPhase(currentQuestions);
                    // Add questions to displayedQuestions to prevent re-triggering
                    setDisplayedQuestions((prev) => [
                        ...prev,
                        ...currentQuestions.map((q) => q.id),
                    ]);
                }
            }
        }
    };




    const bufferHandler = () => {
        if (videoRef.current && bufferRef.current) {
            const buffer = videoRef.current.buffered.length
                ? videoRef.current.buffered.end(0)
                : 0;
            const percentage = (buffer / videoRef.current.duration) * 100;
            bufferRef.current.style.width = `${percentage}%`;
        }
    };

    const volumeChangeHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (volumeRef.current && videoRef.current) {
            const rect = volumeRef.current.getBoundingClientRect();
            const newVolume = (e.clientX - rect.left) / rect.width;
            setVolume(Math.min(Math.max(newVolume, 0), 1));
        }
    };

    const speedChangeHandler = () => {
        if (videoRef.current) {
            const newRate = playbackRate === 2 ? 1 : playbackRate + 0.25;
            videoRef.current.playbackRate = newRate;
            setPlaybackRate(newRate);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, "0");
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    };


    const handleDialogClose = (data: boolean) => {

        if (data && videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="neo-video-player">
            <div className="video-control-part">
                <div className="video-control-general-part">
                    <div className={`play-btn video-neu-btn ${isPlaying ? "pause" : ""}`} onClick={playPauseHandler}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </div>
                    <div className="video-neu-btn drop-btn">
                        <div className="box-sound">
                            <div className="volume" onClick={volumeChangeHandler} ref={volumeRef}>
                                <div className="bar-volume" style={{ width: `${volume * 100}%` }}></div>
                            </div>
                        </div>
                        <div className={`sound-btn video-neu-btn ${volume === 0 ? "mute" : ""}`} onClick={() => setVolume(volume > 0 ? 0 : 0.7)}>
                            {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                        </div>
                    </div>
                </div>
                <div className="video-control-bar-part">
                    <div className="bar-bg">
                        <div className="bar-progress" ref={progressRef}>
                            <div className="bar-time" ref={bufferRef}>
                                <div className="bar-time-box">
                                    <span className="current">{formatTime(currentTime)}</span>
                                    <span> / </span>
                                    <span className="duration">{formatTime(duration)}</span>
                                </div>
                                <div className="bar-pin"></div>
                            </div>
                        </div>
                        <div className="bar-buffer"></div>
                    </div>
                </div>

                <div className="video-control-nav-part">
                    <div className="setting-btn video-neu-btn">
                        <IoSettingsSharp />
                        <div className="fastFwd-box">
                            <input className="btn fastFwd" type="button" value={`Speed : ${playbackRate}x`} onClick={speedChangeHandler} />
                        </div>
                    </div>
                    <div className="fullscreen-btn video-neu-btn" onClick={() => videoRef.current?.requestFullscreen()}>
                        <FaExpand />
                    </div>
                </div>
            </div>

            <video
                className="video-element"
                ref={videoRef}
                onTimeUpdate={updateTimeHandler}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onProgress={bufferHandler}
            >
                <source src={videoUrl} />
            </video>

            <Modal
                size="lg"
                show={isDialogOpen}
                onHide={() => setIsDialogOpen(false)}
                backdrop="static"
                keyboard={false}
                style={{ borderRadius: "none" }}
            >
                <Assessment context={context} userId={userId} Id={trainingId} onDataChange={handleDialogClose} type={"Training"} phase={phase} />
            </Modal>
        </div>
    );
};

export default VideoPlayer;
