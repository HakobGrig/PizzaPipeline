import {Pipeline, PipelineComponent} from './pipelinebase';
import {DoughChefComponent} from './doughchefcomponent';
import {ToppingChefComponent} from './toppingchefcomponent';
import {OvenComponent} from './ovencomponent';
import {Waitercomponent} from './waitercomponent';
import {pizzaInfo} from './pizzainfo';

type duration = {
  start: Date;
  end: Date;
  index: number;
};

export class PizzaPipeline {
  private pipeline: Pipeline<pizzaInfo>;
  private totalOrdersCount: number;
  private finishedOrdersCount: number;
  private startTime?: Date;
  private ordersDuration: duration[] = [];

  constructor() {
    this.pipeline = new Pipeline(
      [
        [new DoughChefComponent(1), new DoughChefComponent(2)],
        [
          new ToppingChefComponent(1),
          new ToppingChefComponent(2),
          new ToppingChefComponent(3),
        ],
        [new OvenComponent(1)],
        [new Waitercomponent(1), new Waitercomponent(2)],
      ],
      this.onSuccess,
      this.onError
    );
    this.totalOrdersCount = 0;
    this.finishedOrdersCount = 0;
  }

  onSuccess = (item: pizzaInfo) => {
    console.log(`Finished item: ${item.index}`);
    const orderDuration = this.ordersDuration.find(
      orderDuration => orderDuration.index === item.index
    );
    orderDuration!.end = new Date();

    ++this.finishedOrdersCount;
    if (this.finishedOrdersCount === this.totalOrdersCount) {
      this.printInfo();
    }
  };

  onError = (err: unknown) => {
    console.log(`Error on item: ${err}`);
  };

  printInfo() {
    console.log(
      `Total time: ${
        (new Date().getTime() - this.startTime!.getTime()) / 1000
      }sec`
    );
    this.ordersDuration.forEach((order, index) => {
      console.log(
        `\t\tOrder number ${index}: ${
          (order.end.getTime() - order.start.getTime()) / 1000
        }sec`
      );
    });
  }

  addItems(items: pizzaInfo[]) {
    this.finishedOrdersCount = 0;
    this.totalOrdersCount = items.length;

    items.forEach(item => {
      this.ordersDuration.push({
        start: new Date(),
        end: new Date(),
        index: item.index,
      });
    });
    this.startTime = new Date();
    this.pipeline.addItems(items);
  }
}
