import { useState, useMemo } from 'react';

export const useCalendar = (initialDate: Date = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const daysArray = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => {
            if (i < firstDayOfMonth) return null;
            return i - firstDayOfMonth + 1;
        });
        return daysArray;
    }, [currentMonth, currentYear]);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return {
        currentDate,
        currentMonth,
        currentYear,
        calendarDays,
        monthName,
        goToNextMonth,
        goToPreviousMonth,
    };
};