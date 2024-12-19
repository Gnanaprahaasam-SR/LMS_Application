import * as React from "react";
import { FC, useState } from "react";
import { IoIosArrowDropright, IoMdTime } from "react-icons/io";
import { IOrientationProps } from "./IOrientationProps";
// import OrientationImage from "../assets/PDFImage.jpg";  // Replace with your image
import styles from "../LearningManagementSystem.module.scss";
import { Link, useSearchParams } from "react-router-dom";
import { LMSApplicationService } from "../../service/LMSService";


interface IOreintationDataProps {
    id: number;
    name: string;
    description: string;
    date: string;
    type: string;
    url: string;
    categoryId: number;
    category: string;
    orientationId: string;
}

const Orientation: FC<IOrientationProps> = (props) => {
    const [lmsOreintations, setLMSOreintations] = useState<IOreintationDataProps[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get("category") || "All";

    const handleCategoryClick = (category: string): void => {
        setSearchParams({ category });
    };

    const fetchDocuments = async (): Promise<void> => {
        const service = new LMSApplicationService(props.context);
        try {
            const documents = await service.getLMSOreintations();
            // console.log("LMS Oreintations:", documents);

            const data = documents.map((doc: { ID: number; OrientationName: string; OrientationDescription: string; Created: string; FileLeafRef: string; FileRef: string; Category: { ID: number; Name: string; };OrientationId: string }) => ({
                id: doc.ID,
                name: doc.OrientationName,
                description: doc.OrientationDescription,
                date: doc.Created,
                type: doc.FileLeafRef.split(".")[-0],
                url: doc.FileRef,
                categoryId: doc.Category.ID,
                category: doc.Category.Name,
                orientationId: doc.OrientationId
            }));

            // console.log("After mapped:", data);
            setLMSOreintations(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    React.useEffect(() => {
        fetchDocuments();
    }, [props.context]);

    const filteredOreintations =
        activeCategory === "All"
            ? lmsOreintations
            : lmsOreintations.filter((doc) => doc.category === activeCategory);


    const getRelativeTime = (dateString: string): string => {
        const contentDate = new Date(dateString);
        const now = new Date();
        const timeDifference = now.getTime() - contentDate.getTime();

        const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const weeksDifference = Math.floor(daysDifference / 7);

        if (hoursDifference < 24) {
            return `${hoursDifference} hr${hoursDifference !== 1 ? 's' : ''} ago`;
        } else if (daysDifference < 7) {
            return `${daysDifference} day${daysDifference !== 1 ? 's' : ''} ago`;
        } else if (daysDifference < 30) {
            return `${weeksDifference} week${weeksDifference !== 1 ? 's' : ''} ago`;
        } else {
            return contentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    };


    return (
        <div className={styles.orientation}>
            {/* Section Selection */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                <div
                    className={`${styles.category} ${activeCategory === "All" ? `${styles.active}` : ""}`}
                    onClick={() => handleCategoryClick("All")}
                >
                    All
                </div>
                {lmsOreintations
                    .map((orientation) => orientation.category)
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


            {/* Display Content in Cards */}
            <div className="row">
                {filteredOreintations.map((content, index) => (
                    <div key={index} className="col-lg-3 col-md-4 col-12 mb-4">
                        <div className={styles.courseCard}>
                            <img
                                src={require('../../assets/PDFImage.jpg')}
                                className={styles.courseImage}
                                alt="Orientation"
                            />
                            <div>
                                <div className="p-3 d-flex flex-column justify-content-between h-100">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h5 className={styles.courseTitle}>{content.name}</h5>
                                            <div className={styles.courseDuration}>
                                                {/* If date is recent, show time ago */}
                                                <IoMdTime size={18} />
                                                {getRelativeTime(content.date)}
                                            </div>
                                        </div>
                                        <p className={styles.CourseDescription}>{content.description}</p>
                                    </div>
                                    <div>
                                        
                                    <Link to={`/orientation/${content.orientationId}`} className="text-decoration-none">
                                        <button className={styles.buttonOne}>
                                            Learn More <IoIosArrowDropright size={24} />
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

export default Orientation;
