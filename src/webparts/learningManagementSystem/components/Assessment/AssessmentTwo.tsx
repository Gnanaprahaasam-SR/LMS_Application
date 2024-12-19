import React, { useState, useEffect } from "react";
import { IAssessmentProps } from "./IAssessmentProps";
import styles from "../LearningManagementSystem.module.scss";
import { LMSApplicationService } from "../../service/LMSService";
// import { useNavigate } from "react-router-dom";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";
import {
    Dialog,
    DialogType,
} from '@fluentui/react';

interface IQuestionProps {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string[];
    questionType: string;
}

const AssessmentTwo: React.FC<IAssessmentProps> = ({ onDataChange, type, Id, context, userId }) => {

    // const navigate = useNavigate();
    const [questions, setQuestions] = useState<IQuestionProps[]>([]);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string[] }>({});
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = React.useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<number>(0);
    const [openAssessment, setOpenAssessment] = React.useState<boolean>(false);

    useEffect(() => {
        onDataChange(openAssessment);
        setTimeout(() => {
            setOpenAssessment(false)
        }, 100);
    }, [openAssessment, onDataChange]);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const closeDialog = (): void => {
        setIsDialogOpen(false);
        setDialogMessage('');
        setDialogTitle('');
    }

    const fetchQuestions = async (LearningType: string, LearningId: string): Promise<void> => {
        const service = new LMSApplicationService(context);
        try {
            const questionsData = await service.getAssessment(LearningType, LearningId);
            const data = questionsData.map((question: any) => {
                const options = [question.Option1, question.Option2, question.Option3, question.Option4].filter(
                    (option) => option !== undefined && option !== null
                );

                return {
                    id: question?.ID, // Ensure the key matches the source data
                    question: question?.Question,
                    options: options.length > 0 ? options : ["No options available"],
                    correctAnswer: question.Answer ? question.Answer.split(":") : [],
                    questionType: question?.QuestionType, // Default to 'single' if missing
                };
            });

            setQuestions(data);
        } catch {
            console.error("Failed to fetch questions");
        }
    };

    useEffect(() => {
        console.log(type, Id);
        if (type && Id) {
            fetchQuestions(type, Id);
        }
    }, [type, Id]);

    const handleComplete = async (finalScore: number): Promise<void> => {
        const service = new LMSApplicationService(context);
        const userInput = JSON.stringify(questions.map((question) => ({
            QuestionId: question.id,
            Answer: userAnswers[question.id].join(","),
        })))
        const passStatus = (finalScore >= (questions.length / 2) ? "Pass" : "Fail")

        const resultData = {
            LearningId: Id,
            LearningType: type,
            TestCandidateId: userId,
            TestScore: finalScore,
            Status: passStatus,
            TestValue: userInput
        }
        try {
            const response = await service.insertLearningScore(resultData);
            console.log(response);
            if (response) {
                setIsDialogOpen(true);
                setDialogTitle('');
                setDialogMessage("Data submitted successfully");
            }

        } catch {
            console.error("Failed to instering the Result");
        }

    }


    const handleOptionChange = (questionId: number, answer: string, isMultiple: boolean): void => {
        setUserAnswers((prev) => {
            const currentAnswers = prev[questionId] || [];
            if (isMultiple) {
                return {
                    ...prev,
                    [questionId]: currentAnswers.includes(answer)
                        ? currentAnswers.filter((a) => a !== answer)
                        : [...currentAnswers, answer],
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [answer],
                };
            }
        });
    };

    const handleSubmit = (): void => {
        const unansweredQuestions = questions.filter(
            (q) => !userAnswers[q.id] || userAnswers[q.id].length === 0
        );

        if (unansweredQuestions.length > 0) {
            setIsDialogOpen(true);
            setDialogTitle('Incomplete Assessment');
            setDialogMessage('Please answer all the questions before submitting.');
            return;
        }

        let calculatedScore = 0;
        questions.forEach((q) => {
            const userAnswer = userAnswers[q.id] || [];
            if (
                q.questionType.toLowerCase() === "single" &&
                userAnswer.length === 1 &&
                userAnswer[0] === q.correctAnswer[0]
            ) {
                calculatedScore++;
            } else if (
                q.questionType.toLowerCase() === "multiple" &&
                userAnswer.length === q.correctAnswer.length &&
                userAnswer.every((ans) => q.correctAnswer.includes(ans))
            ) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setShowResults(true);
        handleComplete(calculatedScore);
    };

    // const handleReset = (): void => {
    //     setUserAnswers({});
    //     setShowResults(false);
    //     setScore(0);
    //     setCurrentQuestionIndex(0);
    // };

    const handleNext = (): void => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = (): void => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    return (
        <div className={`${styles.assessmentContainer}`}>
            <div className={`d-flex justify-content-between `}>

                <h3>Check your understanding</h3>
                {questions.length === 0 && (<button
                    className={styles.buttonOne}
                    onClick={(): void => { setOpenAssessment(true) }} // Navigate to the previous page
                >
                    <IoIosArrowDropleft size={24} /> Back
                </button>)
                }
            </div>

            {questions.length > 0 ? (
                <>
                    {questions.length > 0 && (
                        <div key={questions[currentQuestionIndex].id} style={{ marginBottom: "20px" }}>
                            <h5>
                                {currentQuestionIndex + 1 + `)`} {questions[currentQuestionIndex].question}
                            </h5>
                            {questions[currentQuestionIndex].options.map((option) => {
                                // const isCorrect = questions[currentQuestionIndex].correctAnswer.includes(option);
                                const isSelected = userAnswers[questions[currentQuestionIndex].id]?.includes(option);
                                // const isWrong = !isCorrect && isSelected;
                                // const isMissed = isCorrect && !isSelected;

                                return (
                                    <div key={option} className="form-check">
                                        <input
                                            type={
                                                questions[currentQuestionIndex].questionType.toLowerCase() === "single"
                                                    ? "radio"
                                                    : "checkbox"
                                            }
                                            name={`question-${questions[currentQuestionIndex].id}`}
                                            id={`question-${questions[currentQuestionIndex].id}-option-${option}`}
                                            value={option}
                                            checked={isSelected || false}
                                            onChange={() =>
                                                handleOptionChange(
                                                    questions[currentQuestionIndex].id,
                                                    option,
                                                    questions[currentQuestionIndex].questionType.toLowerCase() ===
                                                    "multiple"
                                                )
                                            }
                                            disabled={showResults}
                                            className="form-check-input"
                                        />
                                        <label htmlFor={`question-${option}`} className={`form-check-label `}>
                                            {option}
                                        </label>
                                    </div>
                                );
                            })}
                            {/* {showResults && (
                                <div>
                                    <p>
                                        <strong>Correct Answer:</strong>{" "}
                                        <span className={styles.correctAnswer}>
                                            {questions[currentQuestionIndex].correctAnswer.join(", ")}
                                        </span>
                                    </p>
                                    {userAnswers[questions[currentQuestionIndex].id]?.some(
                                        (ans) => !questions[currentQuestionIndex].correctAnswer.includes(ans)
                                    ) && (
                                            <p>
                                                <strong>Your Incorrect Answer:</strong>{" "}
                                                <span className={styles.incorrectAnswer}>
                                                    {userAnswers[questions[currentQuestionIndex].id]
                                                        ?.filter((ans) => !questions[currentQuestionIndex].correctAnswer.includes(ans))
                                                        .join(", ")}
                                                </span>
                                            </p>
                                        )}
                                </div>
                            )} */}
                        </div>
                    )}
                    <div className={`d-flex justify-content-between align-items-center`}>
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className={styles.previousButton}
                        >
                            Previous
                        </button>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button onClick={handleNext} className={styles.nextButton}>
                                Next
                            </button>
                        ) : (
                            !showResults &&
                            (<button onClick={handleSubmit} className={styles.submitButton}>
                                Submit
                            </button>)
                        )}
                    </div>

                    {showResults && (
                        <div>
                            <h2>Results</h2>
                            <p>
                                Your score: {score} / {questions.length}
                            </p>
                        </div>)
                    }
                </>
            ) : (
                <p>No data is available for this {type ? type : "content"}. </p>
            )}
            {questions.length > 0 && showResults &&
                <div className="mt-3">
                    <button
                        className={styles.buttonOne}
                        onClick={(): void => { setOpenAssessment(true) }} // Navigate to the previous page
                    >
                        <IoIosCloseCircleOutline size={24} />  Close
                    </button>
                </div>
            }
            <Dialog
                hidden={!isDialogOpen}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: dialogTitle,
                    subText: dialogMessage,
                }}
            >
                <div className="float-end m-3">
                    <button className={`${styles.closeButton} px-3`} onClick={closeDialog} > OK </button>
                </div>
            </Dialog>

        </div>
    );
};



export default AssessmentTwo;
