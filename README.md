Syntax:

```
Program: ( Statement|Expression, Fullstop)+
Statement: Assignement 
Assignment: Identifier Operator->Equals Expression
Operator: Equals Plus Minus Division
Expression: ExpressionStatement Operator? Expression
ExpressionStatement: Identifier|Number
Fullstop: .
```