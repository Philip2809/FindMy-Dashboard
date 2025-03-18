import { createContext, useEffect, useState } from 'react';
import { DataStateContext, TagsWithReports } from '../@types';
import { DataReceiver, ReportPoint } from '../data';


const DataContext = createContext<DataStateContext | null>(null)

export const DataProvider = ({ children }: { children: React.JSX.Element }) => {
    const [tagsWithReports, setTagsWithReports] = useState<TagsWithReports>(new Map());
    const [seeingReports, setSeeingReports] = useState<ReportPoint[]>([]);

    useEffect(() => {
        DataReceiver.getLatest().then((reports) => {
            if (!reports) return;
            console.log(reports);
            setTagsWithReports(reports);
        });
    }, []);

    return (
        <DataContext.Provider value={{ tagsWithReports, seeingReports, setSeeingReports }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;