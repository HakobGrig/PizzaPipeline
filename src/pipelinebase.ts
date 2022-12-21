export class PipelineComponent<Type> {
  private mBusy = false;
  private readonly mName: string;
  private readonly mMaxSimultaneouslyItemsCount: number;
  private mCurrentItemsCount: number;
  private mCurrentComponentNumber: number;

  constructor(
    name: string,
    maxSimultaneouslyItemCount: number,
    currentComponentNumber: number
  ) {
    this.mName = name;
    this.mMaxSimultaneouslyItemsCount = maxSimultaneouslyItemCount;
    this.mCurrentItemsCount = 0;
    this.mCurrentComponentNumber = currentComponentNumber;
  }

  getName(): string {
    return this.mName;
  }

  getComponentNumber(): number {
    return this.mCurrentComponentNumber;
  }

  isBusy(): boolean {
    if (this.mCurrentItemsCount === this.mMaxSimultaneouslyItemsCount) {
      return true;
    }
    return false;
  }

  async handle(input: Type): Promise<Type> {
    if (this.isBusy()) {
      throw new Error('Component busy, try later.');
    }
    ++this.mCurrentItemsCount;
    try {
      return await this._handle(input);
    } finally {
      --this.mCurrentItemsCount;
    }
  }

  async _handle(input: Type): Promise<Type> {
    throw new Error('Not implemented');
  }
}

export class Pipeline<Type> {
  private readonly mComponents: Array<PipelineComponent<Type>[]>;
  private mQueues: Array<Type[]> = [];
  private readonly mOnSuccess: (output: Type) => void;
  private readonly mOnError: (output: unknown) => void;

  constructor(
    components: Array<PipelineComponent<Type>[]>,
    onSuccess: (output: Type) => void,
    onError: (err: unknown) => void
  ) {
    this.mComponents = components;
    this.mComponents.forEach(() => {
      this.mQueues.push([]);
    });

    this.mOnSuccess = onSuccess;
    this.mOnError = onError;
  }

  addItems(items: Type[]) {
    this.mQueues[0].push(...items);
    this.propagateToComponent(0);
  }

  findFreeComponentOfGivenType(
    pipeNumber: number
  ): PipelineComponent<Type> | null {
    for (const component of this.mComponents[pipeNumber]) {
      if (!component.isBusy()) {
        return component;
      }
    }
    return null;
  }

  onSuccessFromComponent(pipeNumber: number, item: Type) {
    this.propagateToComponent(pipeNumber);
    if (pipeNumber === this.mComponents.length - 1) {
      this.mOnSuccess(item);
      return;
    }
    this.mQueues[pipeNumber + 1].push(item);
    this.propagateToComponent(pipeNumber + 1);
  }

  onErrorFromComponent(pipeNumber: number, err: unknown) {
    console.log('Error on item');
    this.mOnError({
      failedOn: this.mComponents[pipeNumber][0].getName(),
      err,
    });
  }

  propagateToComponent(pipeNumber: number) {
    while (this.mQueues[pipeNumber].length) {
      const component = this.findFreeComponentOfGivenType(pipeNumber);
      if (component) {
        component
          .handle(this.mQueues[pipeNumber][0])
          .then((item: Type) => {
            this.onSuccessFromComponent(pipeNumber, item);
          })
          .catch(err => {
            this.onErrorFromComponent(pipeNumber, err);
          });
        this.mQueues[pipeNumber].shift();
      } else {
        return;
      }
    }
  }
}
