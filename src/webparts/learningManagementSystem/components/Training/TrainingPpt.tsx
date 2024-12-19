import * as React from "react";
import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination, Table } from 'react-bootstrap';
import { ITrainingProps } from "./ITrainingProps";


interface ITrainingPptDataProps {
    id: number;
    title: string;
    content: string

}

const TrainingPPTs:React.FC <ITrainingProps> = (props) => {
    const items : ITrainingPptDataProps []= [
        { id: 1, title: 'Onboarding Training', content: 'Content for Onboarding Training.' },
        { id: 2, title: 'Safety Training', content: 'Content for Safety Training.' },
        { id: 3, title: 'Team Collaboration', content: 'Content for Team Collaboration.' },
        { id: 4, title: 'Leadership Skills', content: 'Content for Leadership Skills.' },
    ];

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage: number = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className="p-4">
            <a href={`/`} className="btn btn-secondary mt-3">
                Back to Dashboard
            </a>
            <h2>Training PPTs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.title}</td>
                            <td>
                                <Link to={`/view/training-ppts/${item.id}`} className="btn btn-primary btn-sm">
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination>
                {[...Array(totalPages).keys()].map((number) => (
                    <Pagination.Item
                        key={number}
                        active={number + 1 === currentPage}
                        onClick={() => setCurrentPage(number + 1)}
                    >
                        {number + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default TrainingPPTs;
