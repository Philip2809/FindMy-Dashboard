import { createContext, useEffect, useState } from 'react';
import { DataStateContext, TagsWithReports } from '../@types';
import { DataReceiver, ReportPoint } from '../data';


const DataContext = createContext<DataStateContext | null>(null)

export const DataProvider = ({ children }: { children: React.JSX.Element }) => {
    const [tagsWithReports, setTagsWithReports] = useState<TagsWithReports>(new Map());
    const [seeingReports, setSeeingReports] = useState<ReportPoint[]>([]);
    const [clickedReports, setClickedReports] = useState<ReportPoint[]>([]);

    const refreshData = () => {
        DataReceiver.getLatest().then((reports) => {
            if (!reports) return;
            setTagsWithReports(reports);
        });
    }

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <DataContext.Provider value={{ 
            tagsWithReports, refreshData,
            seeingReports, setSeeingReports,
            clickedReports, setClickedReports
            }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;