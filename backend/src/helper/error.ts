export class ErrorCustom {
    constructor(public status: number, public code: string, public message: string) {}
}

const errors = {
    BAD_REQUEST: new ErrorCustom(400, "BAD_REQUEST", "Bad Request"),
}