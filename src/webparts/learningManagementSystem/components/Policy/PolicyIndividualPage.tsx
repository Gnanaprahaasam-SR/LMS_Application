import React, { FC, useEffect, useState } from 'react';
import { IPolicyProps } from './IPolicyProps';
import { useParams, useNavigate } from 'react-router-dom';
import { LMSApplicationService } from '../../service/LMSService';
import styles from '../LearningManagementSystem.module.scss';
import { IoIosArrowDropleft, } from 'react-icons/io';
import Modal from 'react-bootstrap/Modal';
import AssessmentTwo from '../Assessment/AssessmentTwo';

interface IPolicyDataProps {
    id: number;
    name: string;
    description: string;
    date: string;
    type: string;
    url: string;
    categoryId: number;
    category: string;
    policyId: number;
}

interface ITestStatus {
    LearningId: string,
    LearningType: string,
    Status: string,
    TestCandidatedId: number,
    TestScore: number,
    TestValue: { QuestionId: string, Answer: string }[],
}


const PolicyIndividualPage: FC<IPolicyProps> = (props) => {

    const { policyId } = useParams<{ policyId: string }>();
    const navigate = useNavigate(); // Hook to navigate programmatically
    const [policyDocument, setPolicyDocument] = useState<IPolicyDataProps | null>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [testStatus, setTestStatus] = useState<ITestStatus | null>(null);

    const handleDialogClose = (data: boolean) => {
        if (data) {
            setIsDialogOpen(false);
        }
    };

    const fetchPolicyDocument = async (policyId: string): Promise<void> => {
        const service = new LMSApplicationService(props.context);

        try {
            const formattedPolicyDocument = await service.getPolicyById(policyId);

            if (formattedPolicyDocument) {
                const data: IPolicyDataProps = {
                    id: formattedPolicyDocument[0]?.Id,
                    name: formattedPolicyDocument[0]?.PolicyName,
                    description: formattedPolicyDocument[0]?.PolicyDescription,
                    date: formattedPolicyDocument[0]?.Created,
                    type: formattedPolicyDocument[0]?.FileLeafRef,
                    url: formattedPolicyDocument[0]?.FileRef,
                    categoryId: formattedPolicyDocument[0]?.Category?.ID,
                    category: formattedPolicyDocument[0]?.Category?.Name,
                    policyId: formattedPolicyDocument[0]?.policyId, // Add policyId to the data object for further usage in the component
                };

                setPolicyDocument(data);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            setError('Failed to load the document. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (policyId) {
            fetchPolicyDocument(policyId);
        }
    }, [policyId, props.context]);


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
        if (policyId) {
            checkTestStatus(policyId, "Policy", props.userId);
        }
    }, [policyId]);


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


    if (!policyDocument) {
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
                <button
                    className={styles.buttonOne}
                    onClick={() => navigate(-1)} // Navigate to the previous page
                >
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
                    <h1 className={`${styles.individualTitle}`}>{policyDocument?.name}</h1>
                    <p className={`${styles.individualDescription}`}>{policyDocument?.description}</p>

                    <div className={styles.individualContainer}>
                        <embed
                            src={`${policyDocument?.url}`}
                            style={{
                                width: '100%',
                                height: '90vh',
                                border: 'none',
                                borderRadius: '8px',
                            }}
                            title={`${policyDocument?.name}`}
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
                    <AssessmentTwo context={props.context} userId={props.userId} Id={policyId ? policyId : ""} onDataChange={handleDialogClose} type={"Policy"} />
                </div>
            </Modal>
        </div>
    );
};

export default PolicyIndividualPage;
