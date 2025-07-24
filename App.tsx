import React, { useState, useCallback } from 'react';
import { AppStep } from './types';
import type { SubjectMarks, PredictionResult } from './types';
import CourseSelector from './components/CourseSelector';
import QuotaSelector from './components/QuotaSelector';
import GenderSelector from './components/GenderSelector';
import MarksInputForm from './components/MarksInputForm';
import PredictionResultDisplay from './components/PredictionResultDisplay';
import { getAdmissionPrediction } from './services/geminiService';
import Loader from './components/shared/Loader';

const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
                 <a href="https://www.reddit.com/user/Smooth_Particular101/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button" target="_blank" rel="noopener noreferrer" aria-label="Creator's Reddit Profile">
                    <svg className="w-10 h-10 text-primary-500 hover:text-primary-600 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="currentColor"/>
                      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#fdf2f8"/>
                      <path d="M17.5 7C14.0833 9.16667 12.25 10.25 10 11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 12.5C11.5833 13.6667 9.75 14.75 7.5 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </a>
                <h1 className="text-2xl font-bold text-gray-900">BHU - College Admission Predictor</h1>
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="py-4 mt-auto border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
                Created by <a href="https://www.reddit.com/user/Smooth_Particular101/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 font-medium">Smooth_Particular101</a>
            </p>
        </div>
    </footer>
);


const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>(AppStep.COURSE_SELECTION);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedQuota, setSelectedQuota] = useState<string | null>(null);
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCourseSelect = (courseName: string) => {
        setSelectedCourse(courseName);
        setStep(AppStep.QUOTA_SELECTION);
        setError(null);
    };
    
    const handleQuotaSelect = (quota: string) => {
        setSelectedQuota(quota);
        setStep(AppStep.GENDER_SELECTION);
    };

    const handleGenderSelect = (gender: string) => {
        setSelectedGender(gender);
        setStep(AppStep.MARKS_INPUT);
    };

    const handleMarksSubmit = useCallback(async (marks: SubjectMarks) => {
        if (!selectedCourse || !selectedQuota || !selectedGender) {
            setError("No course, quota, or gender selected. Please go back.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAdmissionPrediction(selectedCourse, marks, selectedQuota, selectedGender);
            setPrediction(result);
            setStep(AppStep.PREDICTION_RESULT);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedCourse, selectedQuota, selectedGender]);

    const handleReset = () => {
        setStep(AppStep.COURSE_SELECTION);
        setSelectedCourse(null);
        setSelectedQuota(null);
        setSelectedGender(null);
        setPrediction(null);
        setError(null);
        setIsLoading(false);
    };
    
    const handleBack = (targetStep: AppStep) => {
        setStep(targetStep);
        setError(null);
         if (targetStep === AppStep.COURSE_SELECTION) {
            setSelectedCourse(null);
            setSelectedQuota(null);
            setSelectedGender(null);
        }
        if (targetStep === AppStep.QUOTA_SELECTION) {
            setSelectedQuota(null);
            setSelectedGender(null);
        }
         if (targetStep === AppStep.GENDER_SELECTION) {
            setSelectedGender(null);
        }
    };


    const renderStep = () => {
        if (isLoading) {
            return <Loader message="Analyzing your profile... The AI is thinking!" />;
        }
        
        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-xl font-semibold text-red-700">An Error Occurred</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={handleReset}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Start Over
                    </button>
                </div>
            );
        }

        switch (step) {
            case AppStep.COURSE_SELECTION:
                return <CourseSelector onCourseSelect={handleCourseSelect} />;
            case AppStep.QUOTA_SELECTION:
                return selectedCourse && <QuotaSelector courseName={selectedCourse} onQuotaSelect={handleQuotaSelect} onBack={() => handleBack(AppStep.COURSE_SELECTION)} />;
            case AppStep.GENDER_SELECTION:
                 return selectedCourse && <GenderSelector courseName={selectedCourse} onGenderSelect={handleGenderSelect} onBack={() => handleBack(AppStep.QUOTA_SELECTION)} />;
            case AppStep.MARKS_INPUT:
                 return selectedCourse && selectedQuota && selectedGender && (
                    <MarksInputForm
                        courseName={selectedCourse}
                        onSubmit={handleMarksSubmit}
                        onBack={() => handleBack(AppStep.GENDER_SELECTION)}
                    />
                );
            case AppStep.PREDICTION_RESULT:
                return prediction && <PredictionResultDisplay result={prediction} onReset={handleReset} />;
            default:
                return <CourseSelector onCourseSelect={handleCourseSelect} />;
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <div className="max-w-4xl mx-auto">
                    {renderStep()}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;