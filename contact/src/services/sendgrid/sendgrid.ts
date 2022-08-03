import sgMail from '@sendgrid/mail'

enum EmailType {
    UserSignedUp = 'user:signed-up',
    UserSignedIn = 'user:signed-in',

    TicketCreated = 'ticket:created',
    TicketUpdated = 'ticket:updated',
    
    OrderCreated = 'order:created',
    OrderCancelled = 'order:cancelled',
    OrderCompleted = 'order:completed',
}

// For using as a 2nd object through 'sendEmail' function
interface EmailData {
    email: string,
    title: string,
    body: string,
}

// TODO: Decide who's gonna use those interfaces
interface Messages {
    subject: EmailType,
    message: string,
}

interface EmailTemp {
    to: string,
    from: string,
    subject: string,
    text: string,
}

const sendEmail = async (type: EmailType, data: EmailData): Promise<void> => {
    const { email, title, body } = data

    const msg: EmailTemp = {
        to: email,
        from: process.env.SENDGRID_EMAIL!,
        subject: title,
        text: body,
    }

    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error(error)
        console.error((error as any).response)
    }
}

export { EmailType, sendEmail }
