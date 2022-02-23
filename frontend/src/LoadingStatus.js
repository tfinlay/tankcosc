export class LoadingNotYetAttempted {

}

export class LoadingPending {

}

export class LoadingDone {

}

export class LoadingError {
    constructor(error) {
        this.error = error
    }
}