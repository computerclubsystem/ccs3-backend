import { Certificate } from 'node:tls';

export class CertificateHelper {
    createStringFromCertificateSubject(subject: Certificate): string {
        const parts: string[] = [];
        Object.keys(subject).map(key => parts.push(`${key}=${this.getObjectValueByKey(subject, key)}`));
        return parts.join(',');
    }

    getObjectValueByKey(obj: any, key: string): any {
        return obj?.[key];
    }
}
