import {PipelineComponent} from './pipelinebase';
import {pizzaInfo} from './pizzainfo';

export class DoughChefComponent extends PipelineComponent<pizzaInfo> {
  constructor(currentComponentNumber: number) {
    super('Dough Chef', 1, currentComponentNumber);
  }

  async _handle(input: pizzaInfo): Promise<pizzaInfo> {
    return new Promise(res => {
      console.log(
        `${this.getName()} ${this.getComponentNumber()} started: ${new Date()}, item: ${
          input.index
        }`
      );
      setTimeout(() => {
        console.log(
          `${this.getName()} ${this.getComponentNumber()} finished: ${new Date()}, item: ${
            input.index
          }`
        );
        res(input);
      }, 7000);
    });
  }
}
