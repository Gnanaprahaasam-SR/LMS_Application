import React, { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LMSApplicationService } from '../../service/LMSService';
import styles from '../LearningManagementSystem.module.scss';
import { IoIosArrowDropleft } from 'react-icons/io';
import { ITrainingIndividualProps, } from './ITrainingProps';
import VideoPlayer from './VideoPlayer';


interface ITrainingDataProps {
    id: number;
    name: string;
    description: string;
    date: string;
    type: string;
    url: string; // URL to the video file
    categoryId?: number;
    category?: string;
    duration?: string;
    trainingId: string;
}

const TrainingIndividualPage: FC<ITrainingIndividualProps> = (props) => {
    const { trainingId } = useParams<{ trainingId: string }>();
    const navigate = useNavigate();
    const [trainingDocument, setTrainingDocument] = useState<ITrainingDataProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [testScore, setTestScore] = useState<number | null>(null);
    const [maxScore, setMaxScore] = useState<number | null>(null);

    const fetchTrainingDocument = async (trainingId: string): Promise<void> => {
        const service = new LMSApplicationService(props.context);

        try {
            const formattedTrainingDocument = await service.getTrainingById(trainingId);
            // console.log(formattedTrainingDocument);
            if (formattedTrainingDocument) {
                const data: ITrainingDataProps = {
                    id: formattedTrainingDocument[0]?.Id,
                    name: formattedTrainingDocument[0]?.TrainingName,
                    description: formattedTrainingDocument[0]?.TrainingDescription,
                    date: formattedTrainingDocument[0]?.Created,
                    type: formattedTrainingDocument[0]?.FileLeafRef,
                    url: formattedTrainingDocument[0]?.FileRef,
                    categoryId: formattedTrainingDocument[0]?.Category?.ID,
                    category: formattedTrainingDocument[0]?.Category?.Name,
                    duration: formattedTrainingDocument[0]?.Duration,
                    trainingId: formattedTrainingDocument[0]?.TrainingId
                };

                setTrainingDocument(data);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            setError('Failed to load the document. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (trainingId) {
            fetchTrainingDocument(trainingId);
        }
    }, [trainingId, props.context]);

    if (loading) {
        return <div className={styles.individual}>Loading...</div>;
    }

    const handleAssessmentStatus = (score: number, outOff: number): void => {
        setTestScore(score);
        setMaxScore(outOff);
    }
    console.log(testScore);


    if (error) {
        return (
            <div className={styles.individual}>
                <p className="text-danger">{error}</p>
                <button className={styles.buttonOne} onClick={() => navigate(-1)}>
                    <IoIosArrowDropleft size={24} /> Back
                </button>
            </div>
        );
    }

    if (!trainingDocument) {
        return (
            <div className={styles.individual}>
                <p className="text-warning">Document not found.</p>
                <button className={styles.buttonOne} onClick={() => navigate(-1)}>
                    <IoIosArrowDropleft size={24} /> Back
                </button>
            </div>
        );
    }

    return (
        <div className={styles.individual}>
            <div className={`d-flex justify-content-between`}>
                <button className={styles.buttonOne} onClick={() => navigate(-1)}>
                    <IoIosArrowDropleft size={24} /> Back
                </button>
                {testScore &&
                    <div className={`d-flex justify-content-center flex-column`} >
                        <span className='fw-bold'>You have already completed this session </span>
                        <span className={styles.taskCompleted}>Your Score: {testScore}/{maxScore}</span>
                    </div>
                }
            </div>
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <h1 className={styles.individualTitle}>{trainingDocument.name}</h1>
                        <p className={styles.individualDescription}>{trainingDocument.description}</p>

                        <div className={styles.individualContainer}>
                            <VideoPlayer videoUrl={trainingDocument.url} userId={props.userId} context={props.context} trainingId={trainingId ? trainingId : ""} onDataChange={handleAssessmentStatus} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingIndividualPage;
