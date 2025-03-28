
import styles from './reports.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useContext, useState } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DataContext from '../../../../context/data';
import ReactIcon from '../../../../icon';
import { formatTime } from '../../../../utils';
import { ReportPoint } from '../../../../data';
import { getMacAddress } from '../../../../utils/key-utils';
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
        <>
            <AutoSizer className={styles.height}>
                {({ height, width }: Size) => (
                    <FixedSizeList
                        height={height}
                        width={width}
                        itemSize={90}
                        itemCount={(context.clickedReports.length ? context.clickedReports.length : context.seeingReports.length) + 1}
                        overscanCount={5}>
                        {({ index, style }: ListChildComponentProps) => {
                            const report = (context.clickedReports.length ? context.clickedReports : context.seeingReports)[index];
                            if (!report) return <div />;
                            // const tag = tags.find(tag => tag.hashed_key === report.properties.hashed_public_key);
                            const tag = context?.tags.get(report.properties.tagId);
                            if (!tag) return null;
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


            {/* Details dialog */}
            {selectedReport && tag && selectedReportKey && (
                <Dialog
                    open={!!selectedReport && !!tag}
                    fullWidth
                    onClose={handleCloseDetailsDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        Report details
                    </DialogTitle>
                    <DialogContent>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar sx={{ backgroundColor: tag.color }}>
                                    <ReactIcon icon={tag.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={tag.name} secondary="" />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Timestamp" secondary={formatTime(selectedReport.properties.timestamp)} />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Published at" secondary={formatTime(selectedReport.properties.published_at)} />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Status" secondary={`${selectedReport.properties.status}`} />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Mac address used" secondary={getMacAddress(selectedReportKey.public_key)} />
                        </ListItem>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDetailsDialog} variant='contained' color='secondary'>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )

};


export default Reports;