
import styles from './tags.module.scss';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { useState, useContext, useRef } from "react";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, TextField } from '@mui/material';
import DataContext from '../../../../context/data';
import ReactIcon from '../../../../icon';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import EyeIcon from '@mui/icons-material/Visibility';
import SwipeableViews from 'react-swipeable-views';
import { getMacAddress } from '../../../../utils/key-utils';
import AddIcon from '@mui/icons-material/Add';
import { Key, Tag } from '../../../../@types';
import { addKey, deleteKey, getPrivateKey } from '../../../../utils/http/keys';


const Tags = () => {

    const context = useContext(DataContext);
    const tags = Array.from(context?.tagsWithReports.keys() || []);
    const [index, setIndex] = useState(0);
    const [selectedTag, setSelectedTag] = useState<Tag>();
    const [selectedKey, setSelectedKey] = useState<Key>();

    const intervalRef = useRef<HTMLDivElement>(null);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [shownPrivateKey, setShownPrivateKey] = useState<string>();

    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
    const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);
    const handleOpenDetailsDialog = () => setOpenDetailsDialog(true);
    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setShownPrivateKey(undefined);
    };

    const handleDelete = () => {
        if (!selectedKey) return;
        deleteKey(selectedKey.public_key).then(() => {
            console.log('Key deleted');
        });
        handleCloseDeleteDialog();
    }


    const handleDetails = () => {
        if (!selectedKey) return;
        getPrivateKey(selectedKey.public_key).then((privateKey) => {
            setShownPrivateKey(privateKey);
        });
    }

    const handleAdd = () => {
        if (!selectedTag) return;
        addKey(selectedTag.id).then(() => {
            console.log('Key added');
        });
        handleCloseAddDialog();
        context?.refreshData();
    }

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
                                    disableRipple
                                    // onClick={() => { console.log('clicked list item') }}
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
                                        <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); setTimeout(() => setIndex(1), 0); }}>
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
                            <Chip label={'Back'} icon={<AddIcon />} style={{ justifyItems: 'flex-start' }} onClick={() => handleOpenAddDialog() } />
                            <Chip label={'Add'} icon={<AddIcon />} onClick={() => handleOpenAddDialog() } />
                        </div>

                        <FixedSizeList
                            height={height - (intervalRef.current?.clientHeight || 0)}
                            width={width}
                            itemSize={90}
                            itemCount={selectedTag.keys.length}
                            overscanCount={5}>
                            {({ index, style }: ListChildComponentProps) => {
                                return (
                                    <ListItem style={style} key={index} alignItems="flex-start">
                                        <ListItemButton
                                            disableRipple
                                            onClick={() => { console.log('clicked list item'); }}
                                            className={styles.row}>
                                            <ListItemText
                                                sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                                primary={selectedTag.keys[index].hashed_public_key}
                                                secondary={getMacAddress(selectedTag.keys[index].public_key)} />
                                            <Stack direction="row" spacing={-1}>
                                                <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); setSelectedKey(selectedTag.keys[index]); handleOpenDetailsDialog(); }}>
                                                    <EyeIcon />
                                                </IconButton>
                                                <IconButton color='inherit' onClick={(e) => { e.stopPropagation(); setSelectedKey(selectedTag.keys[index]); handleOpenDeleteDialog(); }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </ListItemButton>
                                    </ListItem>

                                );
                            }}
                        </FixedSizeList></>
                )}
            </AutoSizer>
        ))
    }

    return (
        <div className={styles.main}>
            <SwipeableViews index={index} resistance enableMouseEvents onChangeIndex={(i) => setIndex(i)}>
                {tabs ? tabs.map((tab, i) => <div style={{ height: '100%' }} key={i}>{tab}</div>) : <></>}
            </SwipeableViews>

            {/* Delete dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    Delete key
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this key?
                        <br />
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} variant='contained' color='secondary'>Cancel</Button>
                    <Button onClick={handleDelete} variant='contained' color='error'>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Add dialog */}
            <Dialog
                open={openAddDialog}
                onClose={handleCloseAddDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    Add key
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        A new private key will be generated and added to the tag. If you want to add
                        an existing key, paste the private key below (in base64). 
                    </DialogContentText>
                    <br />
                    <TextField
                        fullWidth
                        color='success'
                        label='Private key (optional)' />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} variant='contained' color='secondary'>Cancel</Button>
                    <Button onClick={handleAdd} variant='contained' color='success'>Add key</Button>
                </DialogActions>
            </Dialog>

            {/* Details dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={handleCloseDetailsDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    Key details
                </DialogTitle>
                <DialogContent>
                    <Button onClick={handleDetails} variant='contained' color='info'>View private key</Button>
                    <br />
                    <br />
                    { shownPrivateKey && <code> {shownPrivateKey} </code> }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog} variant='contained' color='secondary'>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )

};


export default Tags;