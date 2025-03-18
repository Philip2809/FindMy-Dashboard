
import styles from './tags.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useState, useContext, useRef } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Chip, IconButton, Stack } from '@mui/material';
import DataContext from '../../../../context/data';
import ReactIcon from '../../../../icon';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import EditIcon from '@mui/icons-material/Edit';
import { Tag } from '../../../../temp';
import SwipeableViews from 'react-swipeable-views';
import { getMacAddress } from '../../../../key-utils';
import AddIcon from '@mui/icons-material/Add';

const Tags = () => {

    const context = useContext(DataContext);
    const tags = Array.from(context?.tagsWithReports.keys() || []);
    const [index, setIndex] = useState(0);
    const [selectedTag, setSelectedTag] = useState<Tag>();
    const [selectedKey, setSelectedKey] = useState<string>();

    const intervalRef = useRef<HTMLDivElement>(null);



    console.log(context?.seeingReports);
    const tagsJSX = (
        <AutoSizer className={styles.height}>
            {({ height, width }: Size) => (
                <FixedSizeList
                    height={height}
                    width={width}
                    itemSize={90}
                    itemCount={context?.tagsWithReports.size || 0}
                    overscanCount={5}>
                    {({ index, style }: ListChildComponentProps) => {
                        const tag = tags[index];
                        if (!tag) return null;
                        return (

                            <ListItem style={style} key={index} alignItems="flex-start">
                                <ListItemButton
                                    onClick={() => { console.log('clicked list item') }}
                                    className={styles.row}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ backgroundColor: tag.color, color: 'inherit' }}>
                                            <ReactIcon icon={tag.icon} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                        primary={tag.name}
                                        secondary={'Last seen: 5 minutes ago'} />
                                    <Stack direction="row" spacing={-1}>
                                        <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); setSelectedKey(undefined); setTimeout(() => setIndex(1), 0); }}>
                                            <KeyIcon fontSize='large' />
                                        </IconButton>
                                    </Stack>
                                </ListItemButton>
                            </ListItem>

                        )
                    }}
                </FixedSizeList>
            )}
        </AutoSizer>
    )

    const tabs = [tagsJSX];


    if (selectedTag) {
        console.log(intervalRef);
        tabs.push((
            <AutoSizer className={styles.height}>
            {({ height, width }: Size) => (

                
                <>
                
                <div ref={intervalRef} style={{ display: 'flex', justifyContent: 'flex-end', padding: '1em' }}>
                    <Chip label={'Add'} icon={<AddIcon />} onClick={() => console.log('test')} />
                </div>
                
                <FixedSizeList
                        height={height- (intervalRef.current?.clientHeight || 0)}
                        width={width}
                        itemSize={90}
                        itemCount={10}
                        overscanCount={5}>
                        {({ index, style }: ListChildComponentProps) => {
                            return (

                                <ListItem style={style} key={index} alignItems="flex-start">
                                    <ListItemButton
                                        onClick={() => { console.log('clicked list item'); } }
                                        className={styles.row}>
                                        <ListItemText
                                            sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                            primary={selectedTag.hashed_key}
                                            secondary={getMacAddress(selectedTag.key)} />
                                        <Stack direction="row" spacing={-1}>
                                            <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); setSelectedKey(selectedTag.key); setTimeout(() => setIndex(2), 0); } }>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); } }>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </ListItemButton>
                                </ListItem>

                            );
                        } }
                    </FixedSizeList></>
            )}
        </AutoSizer>
        ))
    }

    if (selectedKey) {
        tabs.push((
            <div>
                <div>{selectedKey}</div>
            </div>
        ))
    }

    return (
        <div className={styles.main}>
            <SwipeableViews index={index} resistance enableMouseEvents onChangeIndex={(i) => setIndex(i)}>
                {tabs ? tabs.map((tab, i) => <div style={{ height: '100%' }} key={i}>{tab}</div>) : <></>}
            </SwipeableViews>
        </div>
    )

};


export default Tags;