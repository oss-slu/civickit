// backend/src/services/notification.service.ts
import { RecordNotFoundError } from '../db/errors';
import { IssueRepository } from '../repositories/issue.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { OrgRepository } from '../repositories/org.repository';
import { PushTokenRepository } from '../repositories/pushToken.repository';
import { PushTokenDTO } from '@civickit/shared/src/types/api';
import * as expoPush from 'expo-server-sdk'

export class NotificationService {
    constructor(private pushTokenRepository: PushTokenRepository,
        private issueRepository: IssueRepository,
        private orgRepository: OrgRepository,
        private membershipRepository: MembershipRepository
    ) { }

    async notifyNewIssue(issueId: string) {
        //get issue
        const issue = await this.issueRepository.findById(issueId)

        if (issue) {
            //get orgs for that issue
            const orgs = await this.orgRepository.findOrgsForIssue(
                issue.latitude,
                issue.longitude,
                issue.category
            )

            //get org members
            let members: string[] = []
            for (let i = 0; i < orgs.length; i++) {
                const orgMemberships = await this
                    .membershipRepository
                    .findByOrganization(orgs[i].id)

                orgMemberships.forEach((om) => {
                    if (om) {
                        members.push(om.userId)
                    }
                })
            }

            //get org members' tokens
            let tokens = []
            for (let i = 0; i < members.length; i++) {
                const token = await this
                    .pushTokenRepository
                    .findByUser(members[i])
                if (token) {
                    tokens.push(...token)
                }
            }
            //send
            const expo = new expoPush.Expo({})

            const messages = tokens.map((pushToken) => {
                if (!expoPush.Expo.isExpoPushToken(pushToken.token)) {
                    throw new Error(`Push Token ${pushToken.token} is not a valid Expo Push Token`)
                }
                return {
                    to: pushToken.token,
                    title: `New Issue In Your Area`,
                    body: issue.title,
                    data: { url: `org.civickit.civickit://maps/details/${issue.id}` },
                }

            })

            const chunks = expo.chunkPushNotifications(messages)
            let tickets = []
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
                    console.log(`result of sending push messages to Expo:`, ticketChunk)
                    tickets.push(...ticketChunk)
                } catch (error) {
                    console.error(error)
                }
            }

            //handle receipts
            const receiptIds = tickets.filter((ticket) =>
                ticket.status === 'ok').map((ticket) => ticket.id)

            const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)

            for (let chunk of receiptIdChunks) {
                try {
                    const receipts = await expo.getPushNotificationReceiptsAsync(chunk)
                    console.log({ chunk, receipts })

                    const failedReceipts = Object.values(receipts).filter(
                        (receipt) => receipt.status !== 'ok'
                    )
                    failedReceipts.forEach(({ message, details }) => {
                        console.error(`There was an error sending a notification: ${message}`)
                        if (details && details.error) {
                            console.error(`The error code is ${details.error}`)
                            if (details.error == 'DeviceNotRegistered') {
                                this.pushTokenRepository.deletePushToken(String(details.expoPushToken))
                            }
                        }
                    })
                } catch (error) {
                    console.error(error)
                }
            }

        }

    }
}