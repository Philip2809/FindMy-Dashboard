import { useContext, useRef, useState } from 'react';
import { Beacon, StaticBeacon as StaticBeaconType } from '../../@types';
import { getMacAddress } from '../../utils/key-utils';
import { CopyText } from '../copy-text';
import { FaCog, FaCopy, FaEye, FaTrash } from '../icons/icons';
import styles from './beacon.module.scss';
import { Dialog } from '../dialog/Dialog';
import { beaconService } from '../../network/beacons';
import DataContext from '../../context/data';

interface BaseProps {
    beacon: StaticBeaconType;
    onBeaconUpdated: () => void;
}

export const StaticBeacon = ({ beacon, onBeaconUpdated }: BaseProps) => {
    const [removeDialog, setRemoveDialog] = useState<string>(); // beacon id
    const [editDialog, setEditDialog] = useState<StaticBeaconType>();
    const macAddress = beacon.public_key ? getMacAddress(beacon.public_key) : undefined;

    return (
        <>
            <div className={styles.beacon}>
                <div>
                    <div className={styles.beaconTitle}>
                        {(beacon.label || macAddress) && <CopyText text={beacon.label || macAddress || 'Empty beacon'} />}
                    </div>
                    <div className={styles.beaconDetails}>
                        {beacon.label && macAddress && <><span>MAC: <CopyText text={macAddress}><b>{macAddress}</b></CopyText></span><br /></>}

                        {beacon.public_key ?
                            <span>Public key: <CopyText text={beacon.public_key} /></span> :
                            <span><i>No key added</i></span>
                        }
                    </div>
                </div>

                <div className={styles.beaconActions}>
                    <FaCog className={styles.beaconButton} id={styles.settings} onClick={() => setEditDialog(beacon)} />
                    <FaTrash className={styles.beaconButton} id={styles.trash} onClick={() => setRemoveDialog(beacon.id)} />
                </div>
            </div>

            {removeDialog && <RemoveDialog beacon={beacon} onBeaconUpdated={onBeaconUpdated} onClose={() => setRemoveDialog(undefined)} />}
            {editDialog && <SettingsDialog beacon={editDialog} onBeaconUpdated={onBeaconUpdated} onClose={() => setEditDialog(undefined)} />}
        </>
    )
}

const AddDialog

const SettingsDialog = ({ beacon, onClose }: BaseProps & { onClose: () => void }) => {
    const context = useContext(DataContext);
    if (!context) return null;

    const keyLabelRef = useRef<HTMLInputElement>(null);
    const privateKeyShowRef = useRef<HTMLInputElement>(null);

    return (
        <Dialog title={'Key settings'} onClose={onClose} actions={[
            {
                label: 'Save',
                onClick: () => {
                    updateKey({
                        ...fmKey,
                        label: keyLabelRef.current?.value || '',
                    }).then(() => {
                        context.refreshData();
                        onClose();
                    });
                }
            },
            { label: 'Cancel', onClick: onClose }
        ]}>
            <span>Label</span>
            <input type='text' placeholder='Label' defaultValue={beacon?.label} ref={keyLabelRef} className={styles.addKeyInput} />
            <span>Private key</span>
            <div className={styles.keySettingsPrivateKey}>
                <input type='password' defaultValue={'my very awesome fake private key that yo'} readOnly disabled ref={privateKeyShowRef} className={`${styles.privateKeyInput} ${styles.addKeyInput}`} />
                <div className={styles.privateKeyActions}>
                    <FaCopy className={styles.actionBtn} size={24} onClick={() => {
                        const input = privateKeyShowRef.current;
                        if (!input) return; // TODO: obscure error handling
                        if (input.hasAttribute('privKey')) {
                            navigator.clipboard.writeText(input.value);
                            input.setSelectionRange(0, input.value.length);
                            return;
                        }

                        getPrivateKey(fmKey.public_key).then((privateKey) => {
                            input.setAttribute('privKey', 'true');
                            input.value = privateKey;
                            navigator.clipboard.writeText(privateKey);
                        });
                    }} />
                    <FaEye className={styles.actionBtn} size={32} onClick={() => {
                        const input = privateKeyShowRef.current;
                        if (!input) return; // TODO: obscure error handling
                        if (input.hasAttribute('privKey')) {
                            input.type = input.type === 'password' ? 'text' : 'password';
                            return;
                        }

                        getPrivateKey(fmKey.public_key).then((privateKey) => {
                            input.setAttribute('privKey', 'true');
                            input.type = 'text';
                            input.value = privateKey;
                        });
                    }} />
                </div>
            </div>
        </Dialog>
    )
}

const RemoveDialog = ({ beacon, onClose, onBeaconUpdated }: BaseProps & { onClose: () => void }) => {
    const context = useContext(DataContext);
    if (!context) return null;

    return (
        <Dialog title={`Remove beacon` + (beacon.label && ` "${beacon.label}"`) + '?'} onClose={onClose} actions={[
            {
                label: 'Remove',
                onClick: () => {
                    beaconService.removeBeacon(beacon.id).then(() => {
                        onBeaconUpdated();
                        onClose();
                    })
                }
            },
            { label: 'Cancel', onClick: onClose }
        ]}>
            Are you sure you want to remove this beacon?
            <br />
            <span style={{ color: 'red' }}>This action cannot be undone.</span>
        </Dialog>
    )
}





