import React, { memo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { RETURN_CHANGE_DELAY, SELECT_PRODUCT_THROTTLE_DELAY } from '@/constants/timer';
import { ACTION } from '@/Provider/VMProvider';
import { Flexbox } from '@/utils/style';
import { throttle } from '@/utils/timer';

const Product = memo(({ name, price, stock, index, purchasable, dispatch, isInProcess }) => {
  const outOfStock = stock === 0;
  const maxNumOfDisplay = 99;
  const [isSelected, setIsSelected] = useState(false);

  const onClick = throttle(() => {
    dispatch({
      type: ACTION.SELECT_PRODUCT,
      payload: { name, price, stock, index },
    });

    isInProcess.current = false;
    setIsSelected(false);
  }, SELECT_PRODUCT_THROTTLE_DELAY * 1000);

  const onClickProduct = (event) => {
    if (isInProcess.current === true) {
      return;
    }

    if (outOfStock || !purchasable) {
      isInProcess.current = false;
      return;
    }

    isInProcess.current = true;
    setIsSelected(true);
    onClick(event);

    dispatch({
      type: ACTION.SET_TIMER,
      payload: {
        key: 'returnChange',
        delay: RETURN_CHANGE_DELAY + SELECT_PRODUCT_THROTTLE_DELAY,
        callback: () => {
          dispatch({ type: ACTION.RETURN_CHANGE });
        },
      },
    });
  };

  return (
    <ProductLayer
      onClick={onClickProduct}
      purchasable={purchasable}
      outOfStock={outOfStock}
      dir="column"
    >
      <Name>{name}</Name>
      <Price>{price.toLocaleString()}원</Price>
      <Stock>
        {outOfStock ? null : Math.min(maxNumOfDisplay, stock)}
        <span>{stock > maxNumOfDisplay && '+'}</span>
      </Stock>
      {outOfStock && <DisabledMark>Out Of Stock</DisabledMark>}
      {isSelected && <ProgressBox />}
    </ProductLayer>
  );
});

const disabled = css`
  border: 2px solid ${({ theme }) => theme.colors.red};
  background-color: ${({ theme }) => theme.colors.primaryRed};
  cursor: not-allowed;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightRed};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.darkRed};
  }
`;

const highlight = css`
  border-color: ${({ theme }) => theme.colors.orange};
  background-color: ${({ theme }) => theme.colors.primaryOrange};

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightOrange};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.darkOrange};
  }
`;

const ProductLayer = styled.span`
  ${Flexbox};
  background-color: ${({ theme }) => theme.colors.primaryBlack};
  border: 2px solid ${({ theme }) => theme.colors.black};
  border-radius: 8px;
  position: relative;
  padding: 4px;
  user-select: none;
  cursor: pointer;
  transition: background-color 400ms;
  width: 120px;
  height: 120px;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightBlack};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.darkBlack};
  }

  ${({ purchasable }) => purchasable && highlight};
  ${({ outOfStock }) => outOfStock && disabled}
`;

const Name = styled.header`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.lg};
  text-align: center;
  flex-grow: 1;
`;

const Price = styled.footer`
  flex-shrink: 0;
`;

const Stock = styled.span`
  ${Flexbox};
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 50px;
  font-weight: bold;
  color: inherit;
  opacity: 0.1;
  transition: opacity 400ms;

  &:hover {
    opacity: 1;
  }

  span {
    font-size: 30px;
  }
`;

const DisabledMark = styled.span`
  ${Flexbox};
  color: ${({ theme }) => theme.colors.white};
  position: absolute;
  bottom: 40px;
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: bold;
  width: 150%;
  height: 30%;
  background-color: #ff233d;
  transform: rotate(-30deg);
`;

const progress = keyframes`
  0% {
    transform: translate3d(0, 100%, 0);
  }
  
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const ProgressBox = styled.div`
  position: absolute;
  background-color: #93ff3c;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 100%, 0);
  opacity: 0.5;
  animation: ${progress} ${SELECT_PRODUCT_THROTTLE_DELAY}s ease-in-out;
`;

export default Product;
