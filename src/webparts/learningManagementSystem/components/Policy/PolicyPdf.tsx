import * as React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination, Table } from 'react-bootstrap';
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface IPolicyPdfDataProps {
    id: number;
    title: string;
    content: string

}
export interface IPolicyPdfProps {
    context: WebPartContext
}

const PolicyPDFs: React.FC<IPolicyPdfProps> = (props) => {


    const items: IPolicyPdfDataProps[] = [
        { id: 1, title: 'Company Policy', content: 'Company Policy Content' },
        { id: 2, title: 'Leave Policy', content: 'Leave Policy Content' },
        { id: 3, title: 'Safety Policy', content: 'Safety Policy Content' },
        { id: 4, title: 'Data Protection Policy', content: 'Data Protection Policy Content' },
    ];

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage: number = 5;

    // Paginate items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className="p-4">
            <a href={`/`} className="btn btn-secondary mt-3">
                Back to Dashboard
            </a>
            <h2>Policy PDFs</h2>
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
                                <Link to={`/view/policy-pdfs/${item.id}`} className="btn btn-primary btn-sm">
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

export default PolicyPDFs;
