import React, { useState, useEffect } from 'react';
import { getQuizzes } from '../../services/quizService';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const QuizList = () => {
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const { courseId } = useParams();

    useEffect(() => {
        if (courseId) {
            getQuizzes(courseId).then(setQuizzes).catch(console.error);
        }
    }, [courseId]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t('quizzes.list_title')}</h1>
                <Link to={`/courses/${courseId}/quizzes/create`} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    {t('quizzes.create_btn')}
                </Link>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quizzes.table.title')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quizzes.table.time_limit')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quizzes.table.passing_score')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quizzes.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {quizzes.map(quiz => (
                            <tr key={quiz.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{quiz.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{quiz.timeLimitSec ? `${Math.floor(quiz.timeLimitSec / 60)} ${t('common.minutes')}` : t('quizzes.no_limit')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{quiz.passingScore}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/quizzes/${quiz.id}`} className="text-indigo-600 hover:text-indigo-900">{t('quizzes.take_quiz')}</Link>
                                </td>
                            </tr>
                        ))}
                        {quizzes.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">{t('quizzes.no_quizzes')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuizList;
