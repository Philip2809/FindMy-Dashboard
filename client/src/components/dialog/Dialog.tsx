
import { Tag } from '../../@types';
import ReactIcon from '../../icon';
import { getMacAddress } from '../../utils/key-utils';
import styles from './Dialog.module.scss';


interface DialogProps {
    onClose?: () => void;
    title: React.ReactNode;
    children: React.ReactNode
}

export const Dialog = ({ children, title, onClose }: DialogProps) => {
    return (
        <div className={styles.dialogBackground}>
            <div className={styles.dialogContainer}>
                <div className={styles.dialogHeader}>
                    <span className={styles.dialogTitle}>{title}</span>
                </div>
                <div className={styles.dialogContent}>
                    {children}
                </div>
                <div className={styles.dialogActions}>
                    <button className={styles.dialogButton} onClick={() => console.log('Action 1')}>Action 1</button>
                    <button className={styles.dialogButton} onClick={() => console.log('Action 2')}>Action 2</button>
                    <button className={styles.dialogButton} onClick={() => onClose?.()}>Close</button>
                </div>
            </div>
        </div>
    )
};

export const TagDialog = ({ tag, onClose }: { tag: Tag; onClose?: () => void }) => {
    return (
        <Dialog title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ color: tag.color, display: 'flex', marginRight: '8px' }}>
                    <ReactIcon icon={tag.icon} />
                </div>
                {tag.name}
            </div>
        }
            onClose={onClose}>
            <div>

                {tag.keys.map((key, index) => (
                    <div key={index} className={styles.keyItem}>


                        // noo i want it this way: make the main title the mac address, and then i can "open" the list item
                        and it "expands" to show the public key and hashed public key, there should also be a button/field to get
                        the private key

                        <div className={styles.keyMacAddress}>
                            {getMacAddress(key.public_key)}
                        </div>
                        <div className={styles.keyTitle}>                       
                            <div className={styles.keyPublicKey}>
                                {key.public_key}
                                </div>
                            <div className={styles.keyHashedPublicKey}>
                                {key.hashed_public_key}
                            </div>
                            <button className={styles.keyButton} onClick={() => console.log('Get Private Key')}>Get Private Key</button>
                            <button className={styles.keyButton} onClick={() => console.log('Delete Key')}>Delete Key</button>
                        </div>


                    </div>
                ))}








            </div>
        </Dialog>
    );
}