import { createContext, useEffect, useState } from 'react';
import { DataStateContext, Reports, Tags } from '../@types';
import { ReportPoint } from '../data';
import styles from './data.module.scss';
import { loadingDispatcher } from '../utils/dispatchers/loading.dispatcher';
import { getReportsTest } from '../network/keys';
import { itemService } from '../network/items';
const DataContext = createContext<DataStateContext | null>(null)

export const DataProvider = ({ children }: { children: React.JSX.Element }) => {
    // TODO: investigate if map is really the best way to store the data.
    const [tags, setTags] = useState<Tags>(new Map());
    const [reports, setReports] = useState<Reports>(new Map());
    const [seeingReports, setSeeingReports] = useState<ReportPoint[] | null>([]);
    const [clickedReports, setClickedReports] = useState<ReportPoint[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportPoint | null>(null);
    const [disabledTags, setDisabledTags] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<{ id: string, message: string }[]>([]);

    const [timeRange, setTimeRange] = useState('240h');
    const [reportsPerTag, setReportsPerTag] = useState(30);

    const refreshData = () => getReportsTest(timeRange, reportsPerTag).then((reports) => {
        setReports(new Map(Object.entries(reports)))
    })

    const getItems = () => itemService.getItems().then((res) => {
        setTags(new Map(res.map((item) => [item.id, item])));
    });

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
        getItems();
        refreshData();
    }, [timeRange, reportsPerTag]);

    return (
        <DataContext.Provider value={{
            tags, reports, getItems, refreshData,
            seeingReports, setSeeingReports,
            clickedReports, setClickedReports,
            selectedReport, setSelectedReport,
            timeRange, setTimeRange,
            reportsPerTag, setReportsPerTag,
            disabledTags, toggleTag,
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