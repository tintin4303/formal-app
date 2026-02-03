import { Criteria } from './types';

export const gradingCriteria: Criteria[] = [
    {
        id: 'content',
        title: '1. Content',
        details: ['Appropriateness of theme', 'Depth of content', 'Logical structure', 'Originality'],
        maxPoints: 30,
    },
    {
        id: 'pronunciation',
        title: '2. Pronunciation & Accuracy',
        details: ['Clarity of pronunciation', 'Accent & Intonation', 'Grammatical accuracy'],
        maxPoints: 25,
    },
    {
        id: 'fluency',
        title: '3. Fluency & Naturalness',
        details: ['Speaking pace', 'Pausing and timing', 'Natural language use', 'Absence of hesitation'],
        maxPoints: 20,
    },
    {
        id: 'expression',
        title: '4. Expression & Delivery',
        details: ['Voice volume and clarity', 'Emotional expression', 'Audience engagement', 'Body language'],
        maxPoints: 15,
    },
    {
        id: 'impression',
        title: '5. Overall Impression',
        details: ['Overall quality', 'Impact on audience', 'Speech impression'],
        maxPoints: 10,
    },
];
