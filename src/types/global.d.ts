declare global {
    const mongoose: {
        conn: unknown | null;
        promise: Promise<unknown> | null;
    };

    interface Activity {
        _id?: string;
        name: string;
        count: number;
        createdAt?: Date;
        updatedAt?: Date;
    }
}

export { }; 