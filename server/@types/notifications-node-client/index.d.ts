declare module 'notifications-node-client' {
  export class NotifyClient {
    constructor(apiKey: string)

    constructor(baseUrl: string, apiKey: string)

    getNotifications(
      templateType?: string,
      status?: string,
      reference?: string,
      olderThanId?: string,
    ): Promise<{
      data: {
        links: {
          current: string
          next?: string
        }
        notifications: Notification[]
      }
    }>
  }

  export interface Notification {
    body?: string
    completed_at?: string
    cost_details?: {
      billable_sms_fragments: number
      international_rate_multiplier: number
      sms_rate: number
    }
    cost_in_pounds: number
    created_at: string
    created_by_name?: string
    email_address?: string
    id: string
    is_cost_data_ready: boolean
    line_1?: string
    line_2?: string
    line_3?: string
    line_4?: string
    line_5?: string
    line_6?: string
    one_click_unsubscribe_url?: string
    phone_number?: string
    postage?: string
    postcode?: string
    reference?: string
    scheduled_for?: string
    sent_at: string
    status: string
    subject?: string
    template: {
      id: string
      uri: string
      version: number
    }
    type: string
  }
}







