import * as React from 'react';
import { useEffect, useState, useRef, FC } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { IoIosArrowDropright } from "react-icons/io";
import { Link } from "react-router-dom";
import styles from "../LearningManagementSystem.module.scss";
import { IDashboardProps } from './IDashboardProps';

interface IHeroContentProps {
    title: string;
    description: string;
    image: string;
    indicator: string;
    link: string;
}

const Dashboard: FC<IDashboardProps> = (props) => {
    const heroContent: IHeroContentProps[] = [
        {
            title: "Empower Your Learning Journey, Anytime, Anywhere",
            description:
                "Explore company policies with ease. Gain clarity on rules, guidelines, and benefits that ensure a productive and harmonious workplace. From compliance to benefits, stay informed about what matters most.",
            image: require("../../assets/PolicyImage.png"), // Correct image path
            indicator: "P",
            link: "/policies"
        },
        {
            title: "Achieve Excellence with Our Orientations",
            description:
                "Start your journey with confidence through comprehensive orientation programs. Learn about company values, roles, and processes designed to set you up for success from day one.",
            image: require("../../assets/TrainingImage.png"), // Correct image path
            indicator: "O",
            link: "/orientations"
        },
        {
            title: "Track Progress and Celebrate Success",
            description:
                "Access tailored training programs that build skills and enhance professional growth. From technical expertise to leadership development, unlock your full potential with our expertly designed courses.",
            image: require("../../assets/OrientationImage.png"),
            indicator: "T",
            link: "/training"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const cycleTime = 10000;

    // Start the interval
    const startTimer = (): void => {
        timerRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % heroContent.length);
        }, cycleTime);
    }

    // Clear the interval
    const resetTimer = (): void => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        startTimer();
    };

    useEffect(() => {
        startTimer(); // Start the interval on mount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        } // Cleanup on unmount
    }, [startTimer]);

    const handleIndicatorClick = (index: number): void => {
        setCurrentIndex(index);
        resetTimer(); // Reset the timer on indicator click
    };

    // Framer Motion Variants
    const textVariants = {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.5 } },
    };

    const imageVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
    };

    return (
        <Container fluid className="py-4">
            <div className={`${styles.heroSection}`}>
                <div className="row pt-2">
                    <div className="col-md-6 col-lg-7">
                        <div className="d-flex align-items-center gap-2 mb-5">
                            {heroContent.map((item, index) => (
                                <span
                                    key={index}
                                    className={`${styles.indicator} ${index === currentIndex ? `${styles.active}` : ""}`}
                                    onClick={() => handleIndicatorClick(index)}
                                >
                                    {item.indicator}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Indicators */}
                    <div className="col-md-7">
                        <div className={`d-flex flex-column justify-content-center gap-4 h-100`}>
                            <motion.div
                                key={currentIndex} // Ensures re-render for animations
                                variants={textVariants}
                                initial='initial'
                                animate='animate'
                                exit='exit'
                                className={`${styles.transition}`}
                            >
                                <h1 className={`${styles.heroTitle}`}>{heroContent[currentIndex].title}</h1>
                                <p className={styles.heroDescription}>
                                    {heroContent[currentIndex].description}
                                </p>
                                <Link className={`text-decoration-none`} to={`${heroContent[currentIndex].link}`}>
                                    <button className={styles.buttonOne}>
                                        Explore Now <IoIosArrowDropright size={24} />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Hero Image Section */}
                    <div className="col-md-5">
                        <motion.div
                            key={currentIndex} // Ensures re-render for animations
                            variants={imageVariants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            className="d-flex align-items-center justify-content-center h-100"
                        >
                            <img
                                src={heroContent[currentIndex].image} // Dynamically set the image source
                                className={styles.imageShadow}
                                alt="hero-image"
                                width="100%"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Dashboard;
