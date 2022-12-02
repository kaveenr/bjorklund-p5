class TuringMech{
    constructor(steps, probability) {
        this.steps = steps;
        this.state = [];
        this.probability = probability;
        for (let i = 0; i < steps; i++) this.state.push(false);
        this.state[0] = true;
    }
    advance() {
        let last = this.state.pop();
        if (this.doMutate()) last = !last;
        this.state.unshift(last);
        return (
            this.state[0] * 4
            +
            this.state[1] * 2
            +
            this.state[2] * 1
        )
    }
    doMutate() {
        let choice = round(random(0,2) * this.probability);
        return choice == 1;
    }
}