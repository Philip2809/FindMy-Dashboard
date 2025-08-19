
import { Beacon, BeaconType, Key, Tag } from '../../@types';
import ReactIcon from '../../icon';
import { getMacAddress } from '../../utils/key-utils';
import styles from './Dialog.module.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import DataContext from '../../context/data';
import { addKey, deleteKey, getPrivateKey, updateKey } from '../../network/keys';
import { deleteTag, addOrUpdateTag, clearAccount } from '../../network/items';
import { CopyText } from '../copy-text';
import { FaCog, FaCopy, FaEye, FaPlus, FaTrash, FaXmark } from '../icons/icons';
import { beaconService } from '../../network/beacons';
import { StaticBeacon } from '../beacons/static-beacon';


interface DialogProps {
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    actions?: {
        label: React.ReactNode;
        onClick: () => void;
    }[]
}

export const Dialog = ({ children, title, actions, onClose }: DialogProps) => {
    return (
        <div className={styles.dialogBackground}>
            <div className={styles.dialogContainer}>
                <div className={styles.dialogHeader}>
                    <div className={styles.dialogTitle}>
                        {title}
                        <FaXmark className={styles.closeBtn} onClick={() => onClose()} />
                    </div>
                </div>
                <div className={styles.dialogContent}>
                    {children}
                </div>
                {actions && (
                    <div className={styles.dialogActions}>
                        {actions.map((action, index) => (
                            <button key={index} onClick={action.onClick} className={styles.dialogButton}>
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
};

export const TagDialog = ({ tag, onClose }: { tag: Tag; onClose: () => void }) => {
    const context = useContext(DataContext);
    if (!context) return null;
    const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);
    const [editTagDialogOpen, setEditTagDialogOpen] = useState(false);
    const [removeTagDialog, setRemoveTagDialog] = useState<string>(); // tag id
    const [removeKeyDialog, setRemoveKeyDialog] = useState<string>(); // public key of key
    const [editKeyDialog, setEditKeyDialog] = useState<Key>(); // public key of key
    const [beacons, setBeacons] = useState<Beacon[]>([]);

    const loadBeacons = () => 
    beaconService.getBeacons(tag.id, `Loading beacons for tag "${tag.name}"`).then((keys) => {
        setBeacons(keys);
    });

    useEffect(() => {
        loadBeacons();
    }, []);

    const addKeyRef = useRef<HTMLInputElement>(null);
    const addKeyLabelRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Dialog title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: tag.color, display: 'flex', marginRight: '8px' }}>
                        <ReactIcon icon={tag.icon} />
                    </div>
                    {tag.name}
                </div>
            }
                actions={[
                    {
                        label: 'Edit',
                        onClick: () => setEditTagDialogOpen(true)

                    },
                    {
                        label: 'Remove',
                        onClick: () => setRemoveTagDialog(tag.id)
                    },
                    {
                        label: 'Close',
                        onClick: onClose
                    }
                ]}
                onClose={onClose}>
                <span>{tag.description}</span>
                <div className={styles.keysActions}>
                    <span>Beacons:</span>
                    <FaPlus className={styles.addKeyBtn} onClick={() => { setAddKeyDialogOpen(true) }} />
                </div>
                <div className={styles.keys}>
                    {beacons.map((beacon, index) => beacon.type === BeaconType.STATIC ? <StaticBeacon key={index} beacon={beacon} onBeaconUpdated={loadBeacons} /> : null)}
                </div>
            </Dialog>

            {removeKeyDialog && <Dialog title='Remove key' onClose={() => setRemoveKeyDialog(undefined)} actions={[
                {
                    label: 'Remove',
                    onClick: () => {
                        deleteKey(removeKeyDialog, `Removing key from tag "${tag.name}"`).then(() => {
                            context.refreshData();
                            setRemoveKeyDialog(undefined);
                        });
                    }
                },
                { label: 'Cancel', onClick: () => { setRemoveKeyDialog(undefined); } }
            ]}>
                Are you sure you want to remove this key?
                <br />
                <span style={{ color: 'red' }}>This action cannot be undone.</span>
            </Dialog>}

            {addKeyDialogOpen && <Dialog title='Add key' onClose={() => setAddKeyDialogOpen(false)} actions={[
                {
                    label: 'Add',
                    onClick: () => {
                        addKey(tag.id, (addKeyRef.current?.value || ''), (addKeyLabelRef.current?.value || ''), `Adding key to tag "${tag.name}"`).then(() => {
                            context.refreshData();
                            setAddKeyDialogOpen(false);
                        });
                    }
                },
                { label: 'Cancel', onClick: () => { setAddKeyDialogOpen(false); } }
            ]}>
                <p>Each BLE beacon is advertising a unique public key, to identify the BLE beacon you can use the label field. </p>

                The public key is generated from the private key. By adding a key a public and private key pair will be generated.
                If you want to use an existing private/public key pair, paste the private key below in base64 format.
                (Functions for incremental and multiple keys are on the way)
                <br />
                <br />
                <input type='text' placeholder='Label (optional)' ref={addKeyLabelRef} className={styles.addKeyInput} />
                <input type='text' placeholder='Private key (optional)' ref={addKeyRef} className={styles.addKeyInput} />
            </Dialog>}

            {editTagDialogOpen && <TagEditDialog tag={tag} onClose={() => setEditTagDialogOpen(false)} />}

            {removeTagDialog && <Dialog title='Delete tag' onClose={() => setRemoveTagDialog(undefined)} actions={[
                {
                    label: 'Remove',
                    onClick: () => {
                        deleteTag(removeTagDialog, `Deleting tag "${tag.name}"`).then(() => {
                            onClose();
                            context.refreshData();
                        });
                    }
                },
                { label: 'Cancel', onClick: () => { setRemoveTagDialog(undefined); } }
            ]}>
                Are you sure you want to remove this tag?
                <br />
                <span style={{ color: 'red' }}>This action cannot be undone.</span>
            </Dialog>}
        </>
    );
}



export const TagEditDialog = ({ tag, onClose }: { tag?: Tag; onClose: () => void }) => {
    const context = useContext(DataContext);
    if (!context) return null;

    const keyNameRef = useRef<HTMLInputElement>(null);
    const keyLabelRef = useRef<HTMLInputElement>(null);
    const keyIconRef = useRef<HTMLInputElement>(null);
    const keyColorRef = useRef<HTMLInputElement>(null);

    const [icon, setIcon] = useState<string>(tag?.icon || '');
    const [color, setColor] = useState<string>(tag?.color || '');

    const inputChange = () => {
        setIcon(keyIconRef.current?.value || '');
        setColor(keyColorRef.current?.value || '');
    };

    return (
        <Dialog title={tag ? 'Edit tag' : 'Add tag'} onClose={onClose} actions={[
            {
                label: 'Save',
                onClick: () => {
                    addOrUpdateTag({
                        ...(tag && { id: tag.id }),
                        name: keyNameRef.current?.value || '',
                        description: keyLabelRef.current?.value,
                        icon: keyIconRef.current?.value || '',
                        color: keyColorRef.current?.value || '',
                    }).then(() => {
                        context.refreshData();
                        onClose();
                    });
                }
            },
            { label: 'Cancel', onClick: onClose }
        ]}>
            <span>Name</span>
            <input type='text' placeholder='Name' defaultValue={tag?.name} ref={keyNameRef} onChange={inputChange} className={styles.addKeyInput} />
            <span>Description</span>
            <input type='text' placeholder='Description' defaultValue={tag?.description} ref={keyLabelRef} onChange={inputChange} className={styles.addKeyInput} />
            <span>Icon <a style={{ color: 'white' }} href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer">(any react icon)</a></span>
            <div className={styles.addTagIconPreviewInput}>
                <span className={styles.addTagIconPreview} style={{ color: color }}><ReactIcon icon={icon} /></span>
                <input type='text' placeholder='React icon (fa/FaTag)' defaultValue={tag?.icon} ref={keyIconRef} onChange={inputChange} className={styles.addKeyInput} />
                <input type='text' placeholder='Icon color (any css color)' defaultValue={tag?.color} ref={keyColorRef} onChange={inputChange} className={styles.addKeyInput} />
            </div>
        </Dialog>
    )
}

export const SettingsDialog = ({ onClose }: { onClose: () => void }) => {
    const context = useContext(DataContext);
    if (!context) return null;

    const mapProviderRef = useRef<HTMLInputElement>(null);

    return (
        <Dialog title={'Settings'} onClose={onClose} actions={[
            {
                label: 'Clear logged in account',
                onClick: () => {
                    clearAccount().then(() => onClose());
                }
            },
            {
                label: 'Save',
                onClick: () => {
                    const mapProvider = mapProviderRef.current?.value || 'osm';
                    localStorage.setItem('mapProvider', mapProvider);
                    onClose();
                }
            },
            { label: 'Cancel', onClick: onClose }
        ]}>
            <span>Map Provider</span>
            <br />
            <span style={{ fontSize: 'small' }}>Enter url for maplibre/mapbox style <b>OR</b> <code>osm</code> for default OpenStreetMap style</span>
            <input type='text' placeholder='Name' defaultValue={localStorage.getItem('mapProvider') || 'osm'} ref={mapProviderRef} className={styles.addKeyInput} />
        </Dialog>
    )
}