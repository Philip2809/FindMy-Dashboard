import { createContext, useEffect, useState } from 'react';
import { DataStateContext, Reports, Tags } from '../@types';
import { DataReceiver, ReportPoint } from '../data';
import styles from './data.module.scss';
import { loadingDispatcher } from '../utils/dispatchers/loading.dispatcher';
const DataContext = createContext<DataStateContext | null>(null)

export const DataProvider = ({ children }: { children: React.JSX.Element }) => {
    const [tags, setTags] = useState<Tags>(new Map());
    const [reports, setReports] = useState<Reports>(new Map());
    const [seeingReports, setSeeingReports] = useState<ReportPoint[]>([]);
    const [clickedReports, setClickedReports] = useState<ReportPoint[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportPoint | null>(null);
    const [disabledTags, setDisabledTags] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<{ id: string, message: string }[]>([]);

    const [timeRange, setTimeRange] = useState('24h');
    const [reportsPerTag, setReportsPerTag] = useState(30);

    const refreshData = () => {
        DataReceiver.getLatest(timeRange, reportsPerTag).then((res) => {
            if (!res) return;
            setTags(res.mappedTags);
            setReports(res.mappedReports);
        });
    }


    const addLoading = (message: string) => {
        // const time = Date.now();
        // setLoading((prev) => [...prev, { time, message }]);
        // return time;
    }
    const removeLoading = (time: number) => {
        // setLoading((prev) => prev.filter((e) => e.time !== time));
    }

    const toggleTag = (tagId: string) => {
        setDisabledTags((prev) => {
            if (prev.has(tagId)) prev.delete(tagId);
            else prev.add(tagId);
            return new Set(prev);
        });
    }

    useEffect(() => {
        const unsubscribe = loadingDispatcher.subscribe((loading) => {
            if (loading.type === 'loading.show') {
                setLoading((prev) => [...prev, { id: loading.id, message: loading.message }]);
            } else if (loading.type === 'loading.hide') {
                setLoading((prev) => prev.filter((e) => e.id !== loading.id));
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        refreshData();
    }, [timeRange, reportsPerTag]);

    return (
        <DataContext.Provider value={{
            tags, reports, refreshData,
            seeingReports, setSeeingReports,
            clickedReports, setClickedReports,
            selectedReport, setSelectedReport,
            timeRange, setTimeRange,
            reportsPerTag, setReportsPerTag,
            disabledTags, toggleTag,
            addLoading, removeLoading
        }}>
            {loading.length > 0 && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <div className={styles.loadings}>
                        <ul>
                            {loading.map((e, index) => (
                                <li key={index}>{e.message}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;