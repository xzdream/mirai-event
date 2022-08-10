namespace Pomelo.Wow.EventRegistration.WCL.Models
{
    public enum EquipmentQuality
    { 
        Gray,
        White,
        Green,
        Blue,
        Purple,
        Orange
    }

    public enum EquipmentPosition
    { 
        Chest,
        Feet,
        Hands,
        Head,
        Legs,
        Shoulder,
        Waist,
        Wrist,
        Trinket,
        Finger,
        Ranged, // 远程
        MainHand, // Main Hand
        TwoHand, // Two-Hand
        HeldInOffHand, // Held In Off-hand 副手
        OffHand, // Off Hand
        OneHand,
        Unknown
    }

    public class Equipment
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public EquipmentQuality Quality { get; set; }

        public int ItemLevel { get; set; }

        public EquipmentPosition Position { get; set; }

        public string ImageUrl { get; set; }
    }
}
