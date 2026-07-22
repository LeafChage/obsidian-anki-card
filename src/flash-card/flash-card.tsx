import { useState, type FC } from "react";
import { FlashCardBody } from "./flash-card-body";
import { FlashCardActions } from "./flash-card-actions";
import type { Rating } from "../core/rating";

type CardData = {
    id: string;
    front: string;
    answer: string;
};

export type FlashCardProps = CardData & {
    onRate?: (rating: Rating) => void;
};

const getSwipeStyle = (direction: "right" | "left" | null) => {
    if (direction === "left") {
        return {
            transform: "translateX(-520px) rotate(-24deg)",
            opacity: 0,
            transition: "transform 220ms ease-out, opacity 220ms ease-out",
        };
    }

    if (direction === "right") {
        return {
            transform: "translateX(520px) rotate(24deg)",
            opacity: 0,
            transition: "transform 220ms ease-out, opacity 220ms ease-out",
        };
    }

    return {
        transform: "translateX(0) rotate(0)",
        opacity: 1,
        transition: "transform 220ms ease-out, opacity 220ms ease-out",
    };
};

// again/hard fly off to the left, good/easy fly off to the right
const directionForRating = (rating: Rating): "left" | "right" =>
    rating === "again" || rating === "hard" ? "left" : "right";

export const FlashCard: FC<FlashCardProps> = ({ front, answer, onRate }) => {
    const [flyDirection, setFlyDirection] =
        useState<"left" | "right" | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const rateCard = (rating: Rating) => {
        setFlyDirection(directionForRating(rating));

        window.setTimeout(() => {
            onRate?.(rating);
            setFlyDirection(null);
        }, 220);
    };

    return (
        <div
            className="flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            style={getSwipeStyle(flyDirection)}
        >
            <FlashCardBody front={front} answer={answer} isFlipped={isFlipped} />
            <FlashCardActions
                onShow={() => setIsFlipped((flipped) => !flipped)}
                onRate={rateCard}
            />
        </div>
    );
};
