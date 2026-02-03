export type Criteria = {
    id: string;
    title: string;
    details: string[];
    maxPoints: number;
};

export type Submission = {
    _id?: string; // MongoDB ID
    id: string;   // UUID
    contestant: string;
    date: string;
    scores: Record<string, number>;
    totalScore: number;
    finalGrade: string;
    timestamp: number;
};
