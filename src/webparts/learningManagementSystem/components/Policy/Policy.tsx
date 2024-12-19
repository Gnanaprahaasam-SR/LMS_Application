import React, { FC } from "react";
import { useState, useEffect } from "react";
import { IoIosArrowDropright, IoMdTime } from "react-icons/io";
import { Link, useSearchParams } from "react-router-dom";
import { IPolicyProps } from "./IPolicyProps";
import { LMSApplicationService } from "../../service/LMSService";
import styles from "../LearningManagementSystem.module.scss";

interface IPolicyDataProps {
    id: number;
    name: string;
    description: string;
    date: string;
    type: string;
    url: string;
    categoryId: number;
    category: string;
    policyId: number; // Optional in case the data is missing
}

const Policies: FC<IPolicyProps> = (props) => {
    const [lmsPolicies, setLMSPolicies] = useState<IPolicyDataProps[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get("category") || "All";

    const fetchDocuments = async (): Promise<void> => {
        const service = new LMSApplicationService(props.context);
        try {
            const documents = await service.getLMSPolicies();
            // console.log("LMS Policies:", documents);

            const data = documents.map((doc: { ID: number; PolicyName: string; PolicyDescription: string; Created: string; FileLeafRef: string; FileRef: string; Category: { ID: number; Name: string; };PolicyId:number }) => ({
                id: doc.ID,
                name: doc.PolicyName,
                description: doc.PolicyDescription,
                date: doc.Created,
                type: doc.FileLeafRef.split(".")[-0],
                url: doc.FileRef,
                categoryId: doc.Category.ID,
                category: doc.Category.Name,
                policyId: doc.PolicyId
            }));

            // console.log("After mapped:", data);
            setLMSPolicies(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [props.context]);

    const handleCategoryClick = (category: string): void => {
        setSearchParams({ category });
    };

    const filteredPolicies =
        activeCategory === "All"
            ? lmsPolicies
            : lmsPolicies.filter((doc) => doc.category === activeCategory);

    const getRelativeTime = (dateString: string): string => {
        const contentDate = new Date(dateString);
        const now = new Date();
        const timeDifference = now.getTime() - contentDate.getTime();

        const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const weeksDifference = Math.floor(daysDifference / 7);

        if (hoursDifference < 24) {
            return `${hoursDifference} hr${hoursDifference !== 1 ? "s" : ""} ago`;
        } else if (daysDifference < 7) {
            return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
        } else if (daysDifference < 30) {
            return `${weeksDifference} week${weeksDifference !== 1 ? "s" : ""} ago`;
        } else {
            return contentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    };

    return (
        <div className={`${styles.policy}`}>
            {/* Category Selection */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                <div
                    className={`${styles.category} ${activeCategory === "All" ? `${styles.active}` : ""}`}
                    onClick={() => handleCategoryClick("All")}
                >
                    All
                </div>
                {lmsPolicies
                    .map((policy) => policy.category)
                    .filter((category, index, self) => self.indexOf(category) === index) // Remove duplicate categories
                    .map((category, index) => (
                        <div
                            key={index}
                            className={`${styles.category} ${activeCategory === category ? `${styles.active}` : ""}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </div>
                    ))}
            </div>

            {/* Display Policies in Cards */}
            <div className="row">
                {filteredPolicies.map((policy, index: number) => (
                    <div key={index} className="col-lg-3 col-md-4 col-12 mb-4">
                        <div className={styles.courseCard}>
                            <img
                                src={require("../../assets/PDFImage.jpg")}
                                className={styles.courseImage}
                                alt="Course"
                            />
                            <div>
                                <div className="p-3 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h5 className={styles.courseTitle}>{policy.name}</h5>
                                            <div className={styles.courseDuration}>
                                                <IoMdTime size={18} />
                                                {getRelativeTime(policy.date)}
                                            </div>
                                        </div>
                                        <p className={styles.CourseDescription}>{policy.description}</p>
                                    </div>
                                    <div>
                                        <Link to={`/policy/${policy.policyId}`} className="text-decoration-none">
                                            <button className={styles.buttonOne}>
                                                View PDF <IoIosArrowDropright size={24} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Policies;
