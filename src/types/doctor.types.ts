export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED"
}

export interface IDoctor {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    averageRating: number;
    createdAt: Date;
    user: {
        status: UserStatus
    }
    specialties: Array<{
        specialtyId: string;
        doctorId: string;
        specialty: {
            id: string;
            title: string;
            icon: string;
        }
    }>
}

export interface IPublicDoctor extends Omit<IDoctor, "user" | "specialties" | "profilePhoto" | "contactNumber" | "address" | "createdAt"> {
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    createdAt: Date | string;
    specialties: Array<{
        specialty: {
            id: string;
            title: string;
            icon: string | null;
        }
    }>;
    reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date | string;
    }>;
}

export interface IDoctorProfile extends Omit<IDoctor, "id" | "user"> {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: UserStatus;
        emailVerified: boolean;
        needPasswordChange: boolean;
        image?: string | null;
        createdAt: Date | string;
    };
    appointments: Array<{
        id: string;
        status: string;
        paymentStatus: string;
        createdAt: Date | string;
        patient: {
            id: string;
            name: string;
            email: string;
            contactNumber?: string | null;
            profilePhoto?: string | null;
        };
        schedule: {
            id: string;
            startDateTime: Date | string;
            endDateTime: Date | string;
        };
        prescription: { id: string } | null;
    }>;
    doctorSchedules: Array<{
        doctorId: string;
        scheduleId: string;
        isBooked: boolean;
        schedule: {
            id: string;
            startDateTime: Date | string;
            endDateTime: Date | string;
        };
    }>;
    reviews: Array<{
        id: string;
        rating: number;
        comment?: string | null;
        createdAt: Date | string;
        appointmentId: string;
        patientId: string;
    }>;
}