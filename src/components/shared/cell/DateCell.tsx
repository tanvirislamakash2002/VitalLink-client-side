import { format } from 'date-fns';
import React from 'react';

interface DateCellProps {
    date: string | Date;
    formatString?: string;
}

const DateCell = ({ date, formatString }: DateCellProps) => {
    if (!date) return <span className="text-sm text-muted-foreground">-</span>

    const formattedDate = format(new Date(date), formatString || "MMM d, yyyy");
    return (
        <span className='text-sm'>
            {formattedDate}
        </span>
    );
};

export default DateCell;