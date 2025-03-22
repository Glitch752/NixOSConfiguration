{ lib, ... }:
{
  # This is apparently more robust than "if condition then trueContent else falseContent"
  mkIfElse = condition: trueContent: falseContent:
  lib.mkMerge [
    (lib.mkIf condition trueContent)
    (lib.mkIf (!condition) falseContent)
  ];
}