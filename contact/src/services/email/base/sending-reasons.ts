export enum SendingReasons {
    UserSignedUp = 'user:signed-up',
    UserSignedIn = 'user:signed-in',
    UserForgotPassword = 'user:forgot-password',
    UserChangedPassword = 'user:changed-password',

    TicketCreated = 'ticket:created',
    TicketUpdated = 'ticket:updated',
    
    OrderCreated = 'order:created',
    OrderCancelled = 'order:cancelled',
    OrderCompleted = 'order:completed',
}
