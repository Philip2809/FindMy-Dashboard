
import styles from './reports.module.scss';
import sharedStyles from '../components.module.scss';

import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useState } from "react";
import DataContext from '../../context/data';
import { ReportPoint } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { FaInfoCircle } from 'react-icons/fa';
import { Dialog } from '../dialog/Dialog';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Reports = () => {
    const context = useContext(DataContext);
    if (!context) return null;


    const [selectedReportDialog, setSelectedReportDialog] = useState<ReportPoint>();

    return (
        <>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <span>Reports - {context.clickedReports.length ? 'clicked' : 'in view'}</span>
                    </div>
                    <div>
                        {/* cannot remember what i wanted this for */}
                        {/* <FaExchangeAlt /> */}
                    </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <AutoSizer>
                        {({ height, width }: Size) => (
                            <FixedSizeList
                                className={styles.reports}
                                height={height}
                                width={width}
                                itemSize={75}
                                itemCount={(context.clickedReports.length ? context.clickedReports.length : context.seeingReports.length)}
                                overscanCount={5}>
                                {({ index, style }: ListChildComponentProps) => {
                                    const report = (context.clickedReports.length ? context.clickedReports : context.seeingReports)[index];
                                    if (!report) return <div />;
                                    const tag = context?.tags.get(report.properties.tagId);
                                    if (!tag) return null;

                                    return (
                                        <div style={style}>
                                            <div className={sharedStyles.listItem} key={index} onClick={() => {
                                                context.setSelectedReport(report);
                                            }}>
                                                <div className={sharedStyles.icon} style={{ color: tag.color }}>
                                                    <ReactIcon icon={tag.icon} />
                                                </div>
                                                <div className={sharedStyles.name}>
                                                    {tag.name}
                                                </div>
                                                <div className={sharedStyles.details}>
                                                    {formatTime(report.properties.timestamp)} - {formatTime(report.properties.published_at)}
                                                </div>
                                                <div className={sharedStyles.actions}>
                                                    <FaInfoCircle style={{ color: Conf_Colors[report.properties.confidence] }} className={sharedStyles.btn} onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedReportDialog(report);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }}
                            </FixedSizeList>

                        )}
                    </AutoSizer>
                </div>
            </div>

            {selectedReportDialog && <Dialog title='Report details' onClose={() => setSelectedReportDialog(undefined)}>
                <span>Accuracy: {selectedReportDialog.properties.horizontal_accuracy}m ({selectedReportDialog.properties.confidence})</span>
                <br />
                <span>Status byte: {selectedReportDialog.properties.status}</span>
                <br />
                <span>Report time: {formatTime(selectedReportDialog.properties.timestamp)}</span>
                <br />
                <span>Published time: {formatTime(selectedReportDialog.properties.published_at)}</span>
                <br />
                <span>Hashed public key: {selectedReportDialog.properties.hashed_public_key}</span>
            </Dialog> }
        </>
    )

};


export default Reports;