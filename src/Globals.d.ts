interface SyntheticEvent<T> {
    currentTarget: EventTarget & T;
}