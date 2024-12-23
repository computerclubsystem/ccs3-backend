import { Certificate } from 'node:tls';

export class CertificateHelper {
    createIssuerSubjectInfo(issuerSubjectString: string): CertificateIssuerSubjectInfo {
        if (!issuerSubjectString?.trim()) {
            return { keysCount: 0, issuerSubjectCertificate: {} } as CertificateIssuerSubjectInfo;
        }

        const parts = issuerSubjectString.split(',');
        const trimmedPairs = parts.map(x => x.trim());
        const cert = {} as Certificate;
        for (const trimmedPair of trimmedPairs) {
            const trimmedParts = trimmedPair.split('=', 2);
            if (trimmedParts.length === 2) {
                const key = trimmedParts[0].trim();
                const value = trimmedParts[1].trim();
                (cert as any)[key] = value;
            }
        }
        const result: CertificateIssuerSubjectInfo = {
            issuerSubjectCertificate: cert,
            keysCount: Object.keys(cert).length,
        };
        return result;
    }

    issuerMatches(clientIssuer: Certificate, issuerSubjectInfo: CertificateIssuerSubjectInfo): boolean {
        if (!clientIssuer || !issuerSubjectInfo) {
            return false;
        }

        const clientIssuerCertKeys = Object.keys(clientIssuer);
        const clientIssuerCertKeysCount = clientIssuerCertKeys.length;
        if (clientIssuerCertKeysCount !== issuerSubjectInfo.keysCount) {
            return false;
        }
        for (const key of clientIssuerCertKeys) {
            const clientIssuerKey = key;
            // The server receives the following object as "issuer":
            // { C: string, CN: string, L: string, O: string, OU: string, ST: string }
            // While the certificate subject as seen in certificate info has "S" instead of "ST":
            // { C: string, CN: string, L: string, O: string, OU: string, S: string }
            // We will substitute "ST" in the client issuer certificate (the one received by the server)
            // with "S" in the provided issuer subject text in the environment variable
            // Sample clientIssuer object obtained from connected client:
            // Subject: C = BG, S = Varna, L = Varna, O = CCS3, OU = Development, CN = CCS3 Certificate Authority
            // The subject value provided by openssl / Windows certificate manager
            // Subject: C = BG, ST = Varna, L = Varna, O = CCS3, OU = Development, CN = CCS3 Certificate Authority
            // TODO: In some cases there is no difference between ST and S
            if (clientIssuerKey === 'S' || clientIssuerKey === 'ST') {
                // Do not compare S/ST keys because in some cases they differ - sometimes is called ST and sometimes just S
                continue;
            }
            const issuerSubjectKey = clientIssuerKey === 'ST' ? 'S' : clientIssuerKey
            const clientIssuerKeyValue = this.getObjectValueByKey(clientIssuer, clientIssuerKey);
            const issuerSubjectKeyValue = this.getObjectValueByKey(issuerSubjectInfo.issuerSubjectCertificate, issuerSubjectKey);
            if (clientIssuerKeyValue !== issuerSubjectKeyValue) {
                return false;
            }
        }

        return true;
    }

    createStringFromCertificateSubject(subject: Certificate): string {
        const parts: string[] = [];
        Object.keys(subject).map(key => parts.push(`${key}=${this.getObjectValueByKey(subject, key)}`));
        return parts.join(',');
    }

    getObjectValueByKey(obj: any, key: string): any {
        return obj?.[key];
    }
}

export interface CertificateIssuerSubjectInfo {
    keysCount: number;
    issuerSubjectCertificate: Certificate;
}
