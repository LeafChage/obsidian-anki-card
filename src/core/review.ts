import { addDays } from "date-fns"
export type Rating = "again" | "hard" | "good" | "easy";

export type ReviewState = {
  cardId: string;
  due: string;
  intervalDays: number;

  /**
   * @description
   * how easy to remember
   * if the words become "good", the word show up in intervalDays * ease
   */
  ease: number;
};

export const DefaultEase = 2.5
export const MinimumEase = 1.3
export const EaseControlSmallGap = 0.15
export const EaseControlBigGap = 0.2

const updateIntervalAndEase = ({ intervalDays, ease }: Pick<ReviewState, "intervalDays" | "ease">, rating: Rating): Pick<ReviewState, "intervalDays" | "ease"> => {
  switch (rating) {
    case "again": {
      return {
        intervalDays: 1,
        ease: Math.max(MinimumEase, ease - EaseControlBigGap)
      }
    }
    case "hard": {
      return {
        intervalDays: Math.max(1, Math.round(intervalDays * 1.2)),
        ease: Math.max(MinimumEase, ease - EaseControlSmallGap)
      }
    }
    case "good": {
      return {
        intervalDays: intervalDays === 0 ? 1 : Math.round(intervalDays * ease),
        ease: ease
      }
    }
    case "easy": {
      return {
        intervalDays: intervalDays === 0 ? 4 : Math.round(intervalDays * ease * 1.3),
        ease: ease + EaseControlSmallGap
      }
    }
  }
}

export const ReviewState = {
  updateSchedule: (card: ReviewState, rating: Rating, now: Date): ReviewState => {
    let { intervalDays, ease } = updateIntervalAndEase(card, rating);

    return {
      ...card,
      intervalDays,
      ease,
      due: addDays(now, intervalDays).toISOString(),
    };
  }
} as const;

