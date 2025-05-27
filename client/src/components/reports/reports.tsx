
import styles from './reports.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useState } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DataContext from '../../context/data';
import { ReportPoint } from '../../data';
import ReactIcon from '../../icon';
import { formatTime } from '../../utils';
import { getMacAddress } from '../../utils/key-utils';
const Conf_Colors: { [key: number]: string } = {
    1: 'red',
    2: 'yellow',
    3: 'lightgreen'
};

const Reports = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const [selectedReport, setSelectedReport] = useState<ReportPoint>();

    const handleCloseDetailsDialog = () => {
        setSelectedReport(undefined);
    };

    const tagId = selectedReport?.properties?.tagId;
    const tag = tagId ? context?.tags?.get(tagId) : undefined;
    const selectedReportKey = tag ? tag.keys.find(key => key.hashed_public_key === selectedReport?.properties.hashed_public_key) : undefined;

    return (
        <AutoSizer>
            {({ height, width }: Size) => (
                <FixedSizeList
                    className={styles.reports}
                    height={height}
                    width={width}
                    itemSize={70}
                    itemCount={(context.clickedReports.length ? context.clickedReports.length : context.seeingReports.length)}
                    overscanCount={5}>
                    {({ index, style }: ListChildComponentProps) => {
                        const report = (context.clickedReports.length ? context.clickedReports : context.seeingReports)[index];
                        if (!report) return <div />;
                        const tag = context?.tags.get(report.properties.tagId);
                        if (!tag) return null;

                        return (
                            <div style={style} className={styles.tag} key={index}>
                                <div className={styles.icon}>
                                    <ReactIcon icon={tag.icon} />
                                </div>
                                <div className={styles.name}>
                                    {tag.name}
                                </div>
                                <div className={styles.details}>
                                    {formatTime(report.properties.timestamp)}
                                </div>
                                <div className={styles.actions}>3</div>
                            </div>
                        )

                        return (
                            <ListItem style={style} key={index} alignItems="flex-start">
                                <ListItemButton
                                    onClick={() => setSelectedReport(report)}
                                    className={styles.row}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ backgroundColor: tag.color }}>
                                            <ReactIcon icon={tag.icon} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                        primary={tag.name}
                                        secondary={formatTime(report.properties.timestamp)} />
                                    <Stack direction="row" spacing={-1}>
                                        <Chip
                                            label={`${report.properties.horizontal_accuracy}m`}
                                            style={{ backgroundColor: Conf_Colors[report.properties.confidence], color: 'black' }}
                                            variant="outlined" size="small" />
                                    </Stack>
                                </ListItemButton>
                            </ListItem>

                        )
                    }}
                </FixedSizeList>

            )}
        </AutoSizer>
    )

};


export default Reports;