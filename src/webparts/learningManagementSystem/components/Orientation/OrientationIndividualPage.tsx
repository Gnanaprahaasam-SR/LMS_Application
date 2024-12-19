import React, { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LMSApplicationService } from '../../service/LMSService';
import styles from '../LearningManagementSystem.module.scss';
import { IoIosArrowDropleft } from 'react-icons/io';
import { IOrientationProps } from './IOrientationProps';
import Modal from 'react-bootstrap/Modal';
import AssessmentTwo from '../Assessment/AssessmentTwo';

interface IOrientationDataProps {
    id: number;
    name: string;
    description: string;
    date: string;
    type: string;
    url: string; // Relative or full URL to the document
    categoryId?: number; // Optional in case the data is missing
    category?: string; // Optional in case the data is missing
}

interface ITestStatus {
    LearningId: string,
    LearningType: string,
    Status: string,
    TestCandidatedId: number,
    TestScore: number,
    TestValue: { QuestionId: string, Answer: string }[],
}

const OrientationIndividualPage: FC<IOrientationProps> = (props) => {
    const { orientationId } = useParams<{ orientationId: string }>(); // id is retrieved as a string
    const navigate = useNavigate();
    const [orientationDocument, setOrientationDocument] = useState<IOrientationDataProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [testStatus, setTestStatus] = useState<ITestStatus | null>(null);

    const handleDialogClose = (data: boolean) => {
        if (data) {
            setIsDialogOpen(false);
        }
    };

    const fetchOrientationDocument = async (orientationId: string): Promise<void> => {
        const service = new LMSApplicationService(props.context);

        try {
            const formattedOrientationDocument = await service.getOrientationById(orientationId);

            // const fullUrl = props.context.pageContext.web.absoluteUrl;
            // const domain = new URL(fullUrl).origin;
            if (formattedOrientationDocument) {
                const data: IOrientationDataProps = {
                    id: formattedOrientationDocument[0]?.Id,
                    name: formattedOrientationDocument[0]?.OrientationName,
                    description: formattedOrientationDocument[0]?.OrientationDescription,
                    date: formattedOrientationDocument[0]?.Created,
                    type: formattedOrientationDocument[0]?.FileLeafRef,
                    url: `${formattedOrientationDocument[0]?.FileRef}`, // Construct full URL
                    categoryId: formattedOrientationDocument[0]?.Category?.ID,
                    category: formattedOrientationDocument[0]?.Category?.Name,
                };

                setOrientationDocument(data);

                // console.log('Document URL:', data.url);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            setError('Failed to load the document. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orientationId) {
            fetchOrientationDocument(orientationId);
        }
    }, [orientationId, props.context]);


    const checkTestStatus = async (Id: string, Type: string, userId: number): Promise<void> => {
        const service = new LMSApplicationService(props.context);
        try {
            const status = await service.getLearningScore(Id, Type, userId);
            const testData: ITestStatus = {
                LearningId: status[0].LearningId,
                LearningType: status[0].LearningType,
                TestCandidatedId: status[0].TestCandidateId,
                TestScore: status[0].TestScore,
                Status: status[0].Status,
                TestValue: JSON.parse(status[0].TestValue)
            }
            setTestStatus(testData);

        } catch (err) {
            console.error('Error checking test status:', err);
        }
    }

    useEffect(() => {
        if (orientationId) {
            checkTestStatus(orientationId, "Orientation", props.userId);
        }
    }, [orientationId]);

    if (loading) {
        return <div className={styles.individual}>Loading...</div>;
    }

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

    if (!orientationDocument) {
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
                {testStatus === null ?
                    (<button className={styles.buttonOne} onClick={() => { setIsDialogOpen(true) }}>
                        Check Your Knowledge
                    </button>) : (
                        <div className={`d-flex justify-content-center flex-column`} >
                            <span className='fw-bold'>You have already completed this session </span>
                            <span className={styles.taskCompleted}>Your Score: {testStatus.TestScore}/{testStatus.TestValue.length}</span>
                        </div>
                    )
                }
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h1 className={styles.individualTitle}>{orientationDocument.name}</h1>
                    <p className={styles.individualDescription}>{orientationDocument.description}</p>

                    <div className={styles.individualContainer}>
                        {/* <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                orientationDocument?.url
                            )}`}
                            width="100%"
                            height="600px"
                            title={orientationDocument.name}
                            style={{
                                border: 'none',
                                borderRadius: '8px',
                            }}
                            loading="lazy" // Optimize iframe loading
                        ></iframe> */}

                        <iframe
                            src={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(
                                orientationDocument?.url
                            )}&action=embedview`}
                            width="100%"
                            height="600px"
                            style={{ border: 'none', borderRadius: '8px' }}
                            title={orientationDocument.name}
                        />
                    </div>
                </div>
            </div>
            <Modal
                size="lg"
                show={isDialogOpen}
                onHide={() => setIsDialogOpen(false)}
                backdrop="static"
                keyboard={false}
                style={{ borderRadius: "0px" }}
            >
                <div className='p-5'>
                    <AssessmentTwo context={props.context} userId={props.userId} Id={orientationId ? orientationId : ""} onDataChange={handleDialogClose} type={"Orientation"} />
                </div>
            </Modal>
        </div>
    );
};

export default OrientationIndividualPage;
