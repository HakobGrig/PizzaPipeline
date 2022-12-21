import {PipelineComponent} from './pipelinebase';
import {pizzaInfo} from './pizzainfo';

export class OvenComponent extends PipelineComponent<pizzaInfo> {
  constructor(currentComponentNumber: number) {
    super('Oven', 2, currentComponentNumber);
  }

  async _handle(input: pizzaInfo): Promise<pizzaInfo> {
    console.log(
      `${this.getName()} ${this.getComponentNumber()} started: ${new Date()}, item: ${
        input.index
      }`
    );
    return new Promise(res => {
      setTimeout(() => {
        console.log(
          `${this.getName()} ${this.getComponentNumber()} finished: ${new Date()}, item: ${
            input.index
          }`
        );
        res(input);
      }, 10000);
    });
  }
}
