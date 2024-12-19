import React, { useState, useEffect } from "react";
import { IAssessmentProps } from "./IAssessmentProps";
import styles from "../LearningManagementSystem.module.scss";
import { LMSApplicationService } from "../../service/LMSService";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Dialog, DialogType } from "@fluentui/react";

export interface IQuestionProps {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string[];
    questionType: string;
    phaseDuration: number;
}

interface ITestStatus {
    LearningId: string,
    LearningType: string,
    Status: string,
    TestCandidatedId: number,
    TestScore: number,
    TestValue: { QuestionId: number, Answer: string }[],
}

interface IAssessmentDataProps {
    phase: IQuestionProps[];
}

const Assessment: React.FC<IAssessmentProps & IAssessmentDataProps> = ({
    onDataChange,
    type,
    Id,
    context,
    userId,
    phase,
}) => {
    const [questions] = useState<IQuestionProps[]>(phase);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string[] }>({});
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [openAssessment, setOpenAssessment] = useState<boolean>(false);

    const [testStatus, setTestStatus] = useState<ITestStatus | null>(null);
    

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");

    const closeDialog = (): void => {
        setIsDialogOpen(false);
        setDialogMessage("");
        setDialogTitle("");
    };


    useEffect(() => {
        onDataChange(openAssessment);
        setTimeout(() => {
            setOpenAssessment(false);
        }, 100);
    }, [openAssessment, onDataChange]);


    const checkTestStatus = async (Id: string, Type: string, userId: number): Promise<void> => {
        const service = new LMSApplicationService(context);
        try {
            const status = await service.getLearningScore(Id, Type, userId);
            const testData: ITestStatus = {
                LearningId: status[0].LearningId,
                LearningType: status[0].LearningType,
                TestCandidatedId: status[0].TestCandidateId,
                TestScore: status[0].TestScore,
                Status: status[0].Status,
                TestValue: JSON.parse(status[0]?.TestValue)
            }
            setTestStatus(testData);

        } catch (err) {
            console.error('Error checking test status:', err);
        }
    }

    useEffect(() => {
        if (Id) {
            checkTestStatus(Id, type, userId);
        }
    }, [Id]);



    const handleOptionChange = (
        questionId: number,
        answer: string,
        isMultiple: boolean
    ): void => {
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

    // const handleSubmit = (): void => {
    //     const unansweredQuestions = questions.filter(
    //         (q) => !userAnswers[q.id] || userAnswers[q.id].length === 0
    //     );

    //     if (unansweredQuestions.length > 0) {
    //         setIsDialogOpen(true);
    //         setDialogMessage("Please answer all the questions before submitting.");
    //         return;
    //     }

    //     let calculatedScore = 0;
    //     questions.forEach((q) => {
    //         const userAnswer = userAnswers[q.id] || [];
    //         if (
    //             q.questionType.toLowerCase() === "single" &&
    //             userAnswer.length === 1 &&
    //             userAnswer[0] === q.correctAnswer[0]
    //         ) {
    //             calculatedScore++;
    //         } else if (
    //             q.questionType.toLowerCase() === "multiple" &&
    //             userAnswer.length === q.correctAnswer.length &&
    //             userAnswer.every((ans) => q.correctAnswer.includes(ans))
    //         ) {
    //             calculatedScore++;
    //         }
    //     });

    //     setScore((prevScore) => prevScore + calculatedScore);
    //     setShowResults(true);

    //     handleComplete();

    // };

    // const handleComplete = async (): Promise<void> => {
    //     const service = new LMSApplicationService(context);
        
    //     const allAnswers = JSON.stringify(
    //         questions.map((q) => ({
    //             QuestionId: q.id,
    //             Answer: userAnswers[q.id]?.join(",") || "No Answer",
    //         }))
    //     );
        
    //     const passStatus = (score >= questions.length / 2) ? "Pass" : "Fail";

    //     const resultData = {
    //         LearningId: Id,
    //         LearningType: type,
    //         TestCandidateId: userId,
    //         TestScore: score,
    //         Status: passStatus,
    //         TestValue: allAnswers,
    //     };

    //     try {
    //         const response = await service.insertLearningScore(resultData);
    //         if (response) {
    //             setIsDialogOpen(true);
    //             setDialogTitle("Success");
    //             setDialogMessage("Data submitted successfully.");
    //         }
    //     } catch (error) {
    //         console.error("Failed to submit the result", error);
    //     }
    // };


    const handleSubmit = (): void => {
        const unansweredQuestions = questions.filter(
            (q) => !userAnswers[q.id] || userAnswers[q.id].length === 0
        );
    
        if (unansweredQuestions.length > 0) {
            setIsDialogOpen(true);
            setDialogMessage("Please answer all the questions before submitting.");
            return;
        }
    
        let calculatedScore = 0;
        const allAnswers = questions.map((q) => ({
            QuestionId: q.id,
            Answer: userAnswers[q.id]?.join(",") || "No Answer",
        }));
    
        // Merge previous answers with the current ones
        const updatedTestValue = [...(testStatus?.TestValue || [])];
    
        allAnswers.forEach((answer) => {
            const existingAnswerIndex = updatedTestValue.findIndex(
                (testAnswer) => testAnswer.QuestionId === answer.QuestionId
            );
    
            if (existingAnswerIndex > -1) {
                // Update the existing answer if it already exists
                updatedTestValue[existingAnswerIndex].Answer = answer.Answer;
            } else {
                // Add new answer to the list if it doesn't exist
                updatedTestValue.push(answer);
            }
    
            // Update the score based on correct answers
            const question = questions.find((q) => q.id === answer.QuestionId);
            if (question) {
                const userAnswer = answer.Answer.split(",");
                if (
                    question.questionType.toLowerCase() === "single" &&
                    userAnswer.length === 1 &&
                    userAnswer[0] === question.correctAnswer[0]
                ) {
                    calculatedScore++;
                } else if (
                    question.questionType.toLowerCase() === "multiple" &&
                    userAnswer.length === question.correctAnswer.length &&
                    userAnswer.every((ans) => question.correctAnswer.includes(ans))
                ) {
                    calculatedScore++;
                }
            }
        });
    
        // Add the new calculated score to the existing score
        const totalScore = (testStatus?.TestScore || 0) + calculatedScore;
        setScore(totalScore);
    
        // Determine the pass status
        const passStatus = totalScore >= (questions.length + (testStatus?.TestValue?.length || 0)) / 2 ? "Pass" : "Fail";
    
        setShowResults(true);
    
        // Call the handleComplete function with updated data
        handleComplete(updatedTestValue, totalScore, passStatus);
    };
    
    const handleComplete = async (
        updatedTestValue: { QuestionId: number; Answer: string }[],
        totalScore: number,
        passStatus: string
    ): Promise<void> => {
        const service = new LMSApplicationService(context);
    
        const resultData = {
            LearningId: Id,
            LearningType: type,
            TestCandidateId: userId,
            TestScore: totalScore,
            Status: passStatus,
            TestValue: JSON.stringify(updatedTestValue), // Updated TestValue with previous and current answers
        };
    
        try {
            const response = await service.insertLearningScore(resultData);
            if (response) {
                setIsDialogOpen(true);
                setDialogTitle("Success");
                setDialogMessage("Data submitted successfully.");
            }
        } catch (error) {
            console.error("Failed to submit the result", error);
        }
    };
    

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
        <div className={styles.assessmentContainer}>
            <div className="d-flex justify-content-between">
                <h3>Check your understanding</h3>
                {questions.length === 0 && (
                    <button
                        className={styles.buttonOne}
                        onClick={() => setOpenAssessment(true)}
                    >
                        <IoIosArrowDropleft size={24} /> Back
                    </button>
                )}
            </div>

            {questions.length > 0 ? (
                <>
                    <div key={questions[currentQuestionIndex].id}>
                        <h5>
                            {currentQuestionIndex + 1}.{" "}
                            {questions[currentQuestionIndex].question}
                        </h5>
                        {questions[currentQuestionIndex].options.map((option) => {
                            const isSelected =
                                userAnswers[questions[currentQuestionIndex].id]?.includes(
                                    option
                                );

                            return (
                                <div key={option} className="form-check">
                                    <input
                                        type={
                                            questions[
                                                currentQuestionIndex
                                            ].questionType.toLowerCase() === "single"
                                                ? "radio"
                                                : "checkbox"
                                        }
                                        name={`question-${questions[currentQuestionIndex].id}`}
                                        value={option}
                                        checked={isSelected || false}
                                        onChange={() =>
                                            handleOptionChange(
                                                questions[currentQuestionIndex].id,
                                                option,
                                                questions[
                                                    currentQuestionIndex
                                                ].questionType.toLowerCase() === "multiple"
                                            )
                                        }
                                        disabled={showResults}
                                        className="form-check-input"
                                    />
                                    <label
                                        htmlFor={`question-${option}`}
                                        className="form-check-label"
                                    >
                                        {option}
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className={styles.previousButton}
                        >
                            Previous
                        </button>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className={styles.nextButton}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className={styles.submitButton}
                                disabled={showResults}
                            >
                                Submit
                            </button>
                        )}
                    </div>

                    {showResults && (
                        <div>
                            <h2>Results</h2>
                            <p>
                                Your score: {score} / {questions.length + (testStatus?.TestValue?.length || 0)}
                            </p>
                        </div>)
                    }
                </>
            ) : (
                <p>No questions available for this phase.</p>
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
                modalProps={{
                    isBlocking: true,
                }}
            >
                <button className={`${styles.closeButton} d-flex justify-content-end`} onClick={closeDialog}>
                    Ok
                </button>
            </Dialog>
        </div>
    );
};

export default Assessment;
