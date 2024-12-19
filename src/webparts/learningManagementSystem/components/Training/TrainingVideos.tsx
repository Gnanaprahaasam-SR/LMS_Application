import * as React from 'react';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination, Table } from 'react-bootstrap';
import { ITrainingVideoProps } from './ITrainingProps';

interface ITrainingVideoDataProps {
    id: number;
    title: string;
    content: string

}

const TrainingVideos:FC<ITrainingVideoProps> = () => {
    const items: ITrainingVideoDataProps[] = [
        { id: 1, title: 'Welcome Video', content: 'Content for Welcome Video.' },
        { id: 2, title: 'Safety Instructions', content: 'Content for Safety Instructions.' },
        { id: 3, title: 'Team Building', content: 'Content for Team Building.' },
        { id: 4, title: 'Time Management', content: 'Content for Time Management.' },
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
            <h2>Training Videos</h2>
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
                                <Link to={`/view/training-videos/${item.id}`} className="btn btn-primary btn-sm">
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

export default TrainingVideos;
