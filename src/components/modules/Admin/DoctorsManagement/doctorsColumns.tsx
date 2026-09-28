import { IDoctor } from "@/types/doctor.types";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

export const doctorColumns: ColumnDef<IDoctor>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Name"
    },
    {
        id: "contactNumber",
        accessorKey: "contactNumber",
        header: "Contact Number",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="text-sm">
                        {row.original?.contactNumber || "N/A"}
                    </span>
                </div>
            )
        }
    },
    {
        id: "experience",
        accessorKey: "experience",
        header: "Experience",
        cell: ({ row }) => {
            return (
                <span className="text-sm font-medium">
                    {row.original.experience ?? 0} years
                </span>
            )
        }
    },
    {
        id: "appointmentFee",
        accessorKey: "appointmentFee",
        header: "Fee",
        cell: ({ row }) => {
            return (
                <span className="text-sm font-semibold text-green-600">
                    ${row.original.appointmentFee?.toFixed(2) ?? "N/A"}
                </span>
            )
        }
    },
    {
        id: "averageRating",
        accessorKey: "averageRating",
        header: "Rating",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                        {row.original.averageRating?.toFixed(1) || "0.0"}
                    </span>
                </div>
            )
        }
    },
    {
        id: "gender",
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
            return (
                <span className="text-sm capitalize">
                    {row.original.gender.toLowerCase()}
                </span>
            )
        }
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Joined On",
        cell: ({ row }) => {
            return (
                <span className="text-sm capitalize">
                    {row.original.createdAt}
                </span>
            )
        }
    },
]