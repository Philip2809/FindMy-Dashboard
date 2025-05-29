import { createContext, useEffect, useState } from 'react';
import { DataStateContext, Tag } from '../@types';
import { DataReceiver, Report, ReportPoint } from '../data';


const DataContext = createContext<DataStateContext | null>(null)

export const DataProvider = ({ children }: { children: React.JSX.Element }) => {
    const [tags, setTags] = useState<Map<number, Tag>>(new Map());
    const [reports, setReports] = useState<Map<number, Report[]>>(new Map());
    const [seeingReports, setSeeingReports] = useState<ReportPoint[]>([]);
    const [clickedReports, setClickedReports] = useState<ReportPoint[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportPoint | null>(null);

    const refreshData = () => {
        console.log('Refreshing data...');
        DataReceiver.getLatest().then((res) => {
            if (!res) return;
            console.log(res.mappedTags)
            setTags(res.mappedTags);
            setReports(res.mappedReports);
        });
    }

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <DataContext.Provider value={{ 
            tags, reports, refreshData,
            seeingReports, setSeeingReports,
            clickedReports, setClickedReports,
            selectedReport, setSelectedReport
            }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;