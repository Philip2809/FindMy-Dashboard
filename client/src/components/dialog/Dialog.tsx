
import { FaXmark } from 'react-icons/fa6';
import { Tag } from '../../@types';
import ReactIcon from '../../icon';
import { getMacAddress } from '../../utils/key-utils';
import styles from './Dialog.module.scss';
import { FaKey, FaPlus, FaTrash } from 'react-icons/fa';
import { useContext, useRef, useState } from 'react';
import { addKey, deleteKey, getPrivateKey } from '../../utils/http/keys';
import DataContext from '../../context/data';
import { addOrUpdateTag, deleteTag } from '../../utils/http/tags';


interface DialogProps {
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    actions?: {
        label: string;
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
    const [privateKeyDialog, setPrivateKeyDialog] = useState<string>(); // public key of key

    const addKeyRef = useRef<HTMLInputElement>(null);
    const privateKeyShowRef = useRef<HTMLElement>(null);

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
                    }
                ]}
                onClose={onClose}>
                <span>Label: {tag.label}</span>
                <div className={styles.keysActions}>
                    <span>Keys:</span>
                    <FaPlus className={styles.addKeyBtn} onClick={() => { setAddKeyDialogOpen(true) }} />
                </div>
                <div className={styles.keys}>
                    {tag.keys.map((key, index) => (
                        <div key={index} className={styles.key}>
                            <div className={styles.keyInfo}>
                                <div className={styles.keyTitle}>
                                    {getMacAddress(key.public_key)}
                                </div>
                                <div className={styles.keyDetails}>
                                    <span>Public key: {key.public_key}</span>
                                    <br />
                                    <span>Hashed public key: {key.hashed_public_key}</span>
                                </div>
                            </div>

                            <div className={styles.keyActions}>
                                <FaKey className={styles.keyButton} id={styles.key} onClick={() => setPrivateKeyDialog(key.public_key)} />
                                <FaTrash className={styles.keyButton} id={styles.trash} onClick={() => setRemoveKeyDialog(key.public_key)} />
                            </div>
                        </div>
                    ))}
                </div>
            </Dialog>

            {removeKeyDialog && <Dialog title='Remove key' onClose={() => setRemoveKeyDialog(undefined)} actions={[
                {
                    label: 'Remove',
                    onClick: () => {
                        const loadingId = context.addLoading(`Removing key from tag "${tag.name}"`);
                        deleteKey(removeKeyDialog).then(() => {
                            context.removeLoading(loadingId);
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

            {privateKeyDialog && <Dialog title='Private key' onClose={() => setPrivateKeyDialog(undefined)} actions={[
                {
                    label: 'Get Private Key',
                    onClick: () => {
                        const loadingId = context.addLoading(`Fetching private key for tag "${tag.name}"`);
                        getPrivateKey(privateKeyDialog).then((privateKey) => {
                            context.removeLoading(loadingId);
                            if (privateKeyShowRef.current) {
                                privateKeyShowRef.current.textContent = privateKey;
                            }
                        });
                    }
                }
            ]}>
                <code ref={privateKeyShowRef}>View the private key by pressing the button below</code>
            </Dialog>}

            {addKeyDialogOpen && <Dialog title='Add key' onClose={() => setAddKeyDialogOpen(false)} actions={[
                {
                    label: 'Add',
                    onClick: () => {
                        const loadingId = context.addLoading(`Adding key to tag "${tag.name}"`);
                        addKey(tag.id, addKeyRef.current?.value || '').then(() => {
                            context.removeLoading(loadingId);
                            context.refreshData();
                            setAddKeyDialogOpen(false);
                        });
                    }
                },
                { label: 'Cancel', onClick: () => { setAddKeyDialogOpen(false); } }
            ]}>
                A new private key will be generated and added to the tag. If you want to add an existing key, paste the private key below (in base64).
                <br />
                <br />
                <input type='text' placeholder='Private key (optional)' ref={addKeyRef} className={styles.addKeyInput} />
            </Dialog>}

            {editTagDialogOpen && <TagEditDialog tag={tag} onClose={() => setEditTagDialogOpen(false)} />}

            {removeTagDialog && <Dialog title='Delete tag' onClose={() => setRemoveTagDialog(undefined)} actions={[
                {
                    label: 'Remove',
                    onClick: () => {
                        const loadingId = context.addLoading(`Deleting tag "${tag.name}"`);
                        deleteTag(removeTagDialog).then(() => {
                            onClose();
                            context.removeLoading(loadingId);
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

    return (
        <Dialog title={tag ? 'Edit tag' : 'Add tag'} onClose={onClose} actions={[
            {
                label: 'Save',
                onClick: () => {
                    const loadingId = context.addLoading(`Saving tag`);
                    addOrUpdateTag({
                        ...(tag && { id: tag.id }),
                        name: keyNameRef.current?.value || '',
                        label: keyLabelRef.current?.value || '',
                        icon: keyIconRef.current?.value || '',
                        color: keyColorRef.current?.value || '',
                    }).then(() => {
                        context.removeLoading(loadingId);
                        context.refreshData();
                        onClose();
                    });
                }
            },
            { label: 'Cancel', onClick: onClose }
        ]}>
            <input type='text' placeholder='Name' defaultValue={tag?.name} ref={keyNameRef} className={styles.addKeyInput} />
            <input type='text' placeholder='Label' defaultValue={tag?.label} ref={keyLabelRef} className={styles.addKeyInput} />
            <input type='text' placeholder='Icon' defaultValue={tag?.icon} ref={keyIconRef} className={styles.addKeyInput} />
            <input type='text' placeholder='Color' defaultValue={tag?.color} ref={keyColorRef} className={styles.addKeyInput} />
        </Dialog>
    )
}